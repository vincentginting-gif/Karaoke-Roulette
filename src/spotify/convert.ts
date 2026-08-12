// ─────────────────────────────────────────────────────────────
//  Playlist-Konverter – fremde Liste (Melon, YT Music …) -> Spotify
//
//  Parst eine eingefügte "Titel – Interpret"-Liste, sucht jeden
//  Eintrag im Spotify-Katalog und bewertet die Treffer per Fuzzy-
//  Matching (Sørensen-Dice auf Bigrammen) mit Konfidenz-Klassen.
// ─────────────────────────────────────────────────────────────

import { searchCandidates } from './api'
import type { Track } from './types'

/** Ein geparster Eingabe-Eintrag. */
export interface ParsedLine {
  raw: string
  title: string
  artist: string
}

export type MatchStatus = 'high' | 'medium' | 'low' | 'none'

/** Abgleich-Ergebnis eines Eintrags gegen den Spotify-Katalog. */
export interface MatchResult {
  input: ParsedLine
  /** Alle Kandidaten (nach Konfidenz sortiert), inkl. Score. */
  candidates: { track: Track; score: number }[]
  /** Index des aktuell gewählten Kandidaten (-1 = keiner). */
  chosenIndex: number
  status: MatchStatus
  /** Wird der Eintrag in die neue Playlist übernommen? */
  include: boolean
}

// ── Parsing ──────────────────────────────────────────────────

const SEPARATORS = ['\t', ' — ', ' – ', ' - ', '—', '–', ' · ', ' | ']

/** Entfernt führende Nummerierung wie "1.", "12)", "03 -". */
function stripLeadingNumber(s: string): string {
  return s.replace(/^\s*\d{1,3}[.)\]]?\s+/, '')
}

/**
 * Zerlegt eine Zeile in Titel + Interpret. `artistFirst` dreht die
 * Reihenfolge (manche Exporte sind "Interpret – Titel").
 */
function parseLine(rawLine: string, artistFirst: boolean): ParsedLine | null {
  const raw = rawLine.trim()
  if (!raw) return null
  const line = stripLeadingNumber(raw)

  let a = line
  let b = ''
  for (const sep of SEPARATORS) {
    const idx = line.indexOf(sep)
    if (idx > 0) {
      a = line.slice(0, idx).trim()
      b = line.slice(idx + sep.length).trim()
      break
    }
  }

  const title = artistFirst ? b || a : a
  const artist = artistFirst ? a : b
  // Ohne Trenner: alles ist Titel (b bleibt leer).
  if (!b) return { raw, title: line.trim(), artist: '' }
  return { raw, title: title.trim(), artist: artist.trim() }
}

/** Parst den gesamten eingefügten Text in Einträge (leere Zeilen ignoriert). */
export function parseList(text: string, artistFirst: boolean): ParsedLine[] {
  return text
    .split(/\r?\n/)
    .map((l) => parseLine(l, artistFirst))
    .filter((l): l is ParsedLine => l !== null && l.title.length > 0)
}

// ── Ähnlichkeit (Sørensen-Dice auf Bigrammen) ────────────────

/** Normalisiert für den Vergleich: Kleinschreibung, Zusätze/Sonderzeichen weg. */
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // Diakritika entfernen
    .replace(/\(feat[^)]*\)/g, ' ')
    .replace(/\bfeat\.?\b.*$/g, ' ')
    .replace(/\((?:[^)]*\b(?:remaster|remastered|remix|version|live|radio edit|explicit|mono|stereo)\b[^)]*)\)/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function bigrams(s: string): Map<string, number> {
  const m = new Map<string, number>()
  for (let i = 0; i < s.length - 1; i++) {
    const g = s.slice(i, i + 2)
    m.set(g, (m.get(g) ?? 0) + 1)
  }
  return m
}

/** Dice-Koeffizient 0..1 zweier Strings (bigrammbasiert). */
function dice(a: string, b: string): number {
  if (a === b) return 1
  if (a.length < 2 || b.length < 2) return 0
  const A = bigrams(a)
  const B = bigrams(b)
  let inter = 0
  let total = 0
  for (const [g, c] of A) {
    total += c
    const d = B.get(g)
    if (d) inter += Math.min(c, d)
  }
  for (const [, c] of B) total += c
  return (2 * inter) / total
}

/** Score 0..1: 65% Titel-, 35% Interpret-Ähnlichkeit (nur Titel, falls kein Artist). */
function scoreCandidate(input: ParsedLine, cand: Track): number {
  const titleSim = dice(norm(input.title), norm(cand.title))
  if (!input.artist) return titleSim

  const inA = norm(input.artist)
  const candA = norm(cand.artist)
  let artistSim = dice(inA, candA)
  // "includes"-Bonus: Interpret taucht im (Mehr-)Artist-Feld auf.
  if (candA.includes(inA) || inA.includes(candA)) artistSim = Math.max(artistSim, 0.9)
  return 0.65 * titleSim + 0.35 * artistSim
}

function classify(score: number, hasCandidate: boolean): MatchStatus {
  if (!hasCandidate) return 'none'
  if (score >= 0.72) return 'high'
  if (score >= 0.45) return 'medium'
  return 'low'
}

// ── Ein einzelner Eintrag ────────────────────────────────────

function buildQueries(input: ParsedLine): string[] {
  const q: string[] = []
  if (input.artist) {
    q.push(`track:"${input.title}" artist:"${input.artist}"`)
    q.push(`${input.title} ${input.artist}`)
  } else {
    q.push(input.title)
  }
  return q
}

/** Sucht + bewertet einen Eintrag; liefert das MatchResult. */
export async function matchOne(input: ParsedLine): Promise<MatchResult> {
  const byId = new Map<string, Track>()
  for (const query of buildQueries(input)) {
    const found = await searchCandidates(query)
    for (const tr of found) if (!byId.has(tr.id)) byId.set(tr.id, tr)
    // Genug gute Kandidaten? Dann nicht weiter suchen.
    if (byId.size >= 5) break
  }

  const scored = [...byId.values()]
    .map((track) => ({ track, score: scoreCandidate(input, track) }))
    .sort((x, y) => y.score - x.score)

  const best = scored[0]
  const status = classify(best?.score ?? 0, scored.length > 0)
  return {
    input,
    candidates: scored,
    chosenIndex: scored.length > 0 ? 0 : -1,
    status,
    // Niedrige/keine Treffer standardmäßig NICHT übernehmen (Nutzer prüft).
    include: status === 'high' || status === 'medium',
  }
}

/**
 * Gleicht alle Einträge ab – mit begrenzter Nebenläufigkeit, damit Spotify
 * nicht mit Anfragen überflutet wird. Meldet Fortschritt via onProgress.
 */
export async function matchAll(
  inputs: ParsedLine[],
  onProgress: (done: number, total: number) => void,
  concurrency = 4,
): Promise<MatchResult[]> {
  const results: MatchResult[] = new Array(inputs.length)
  let next = 0
  let done = 0

  async function worker() {
    while (next < inputs.length) {
      const i = next++
      results[i] = await matchOne(inputs[i])
      done++
      onProgress(done, inputs.length)
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, inputs.length) }, () => worker())
  await Promise.all(workers)
  return results
}
