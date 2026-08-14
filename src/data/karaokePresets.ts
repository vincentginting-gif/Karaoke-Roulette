// ─────────────────────────────────────────────────────────────
//  Fertige Song-Listen für den Offline-Modus.
//  International (Top 100), Deutsche Hits und K-Pop.
//  Format je Zeile: „Titel - Interpret".
// ─────────────────────────────────────────────────────────────

import { KARAOKE_TOP_100 } from './karaokeTop100'

/** Beliebte deutsche Karaoke-/Mitsing-Hits (NDW, Schlager, Deutschrock, Pop). */
export const KARAOKE_DE: string[] = [
  '99 Luftballons - Nena',
  'Atemlos durch die Nacht - Helene Fischer',
  'Major Tom (Völlig losgelöst) - Peter Schilling',
  'Marmor, Stein und Eisen bricht - Drafi Deutscher',
  'Griechischer Wein - Udo Jürgens',
  'Ich war noch niemals in New York - Udo Jürgens',
  'Über den Wolken - Reinhard Mey',
  'Skandal im Sperrbezirk - Spider Murphy Gang',
  'Rock Me Amadeus - Falco',
  'Der Kommissar - Falco',
  'Haus am See - Peter Fox',
  'Männer - Herbert Grönemeyer',
  'Bochum - Herbert Grönemeyer',
  'Westerland - Die Ärzte',
  'Schrei nach Liebe - Die Ärzte',
  'Junge - Die Ärzte',
  'Tage wie diese - Die Toten Hosen',
  'Hier kommt Alex - Die Toten Hosen',
  'Ein Kompliment - Sportfreunde Stiller',
  'Applaus, Applaus - Sportfreunde Stiller',
  'Auf uns - Andreas Bourani',
  'Astronaut - Sido & Andreas Bourani',
  'Lieder - Adel Tawil',
  'Nur noch kurz die Welt retten - Tim Bendzko',
  '80 Millionen - Max Giesinger',
  'Symphonie - Silbermond',
  'Das Beste - Silbermond',
  'Nur ein Wort - Wir sind Helden',
  'Aurélie - Wir sind Helden',
  'MfG - Die Fantastischen Vier',
  'Dickes B - Seeed',
  'Ein Stern (der deinen Namen trägt) - DJ Ötzi & Nik P.',
  'Anton aus Tirol - DJ Ötzi',
  "Verdammt, ich lieb' dich - Matthias Reim",
  'Ohne dich (schlaf ich heut Nacht nicht ein) - Münchener Freiheit',
  'Über sieben Brücken musst du gehn - Karat',
  'Du - Peter Maffay',
  'Hulapalu - Andreas Gabalier',
  'Cordula Grün - Josh',
  'Wie schön du bist - Sarah Connor',
  'Vincent - Sarah Connor',
  'Ein bisschen Frieden - Nicole',
  'Wahnsinn - Wolfgang Petry',
  'Lemon Tree - Fools Garden',
]

/** Beliebte K-Pop-Karaoke-Songs (Gruppen & Solo, verschiedene Generationen). */
export const KARAOKE_KPOP: string[] = [
  'Dynamite - BTS',
  'Butter - BTS',
  'Boy With Luv - BTS',
  'DNA - BTS',
  'Permission to Dance - BTS',
  'Fake Love - BTS',
  'Idol - BTS',
  'Spring Day - BTS',
  'Seven - Jung Kook',
  'Standing Next to You - Jung Kook',
  'Gangnam Style - PSY',
  'Gentleman - PSY',
  'DDU-DU DDU-DU - BLACKPINK',
  'How You Like That - BLACKPINK',
  'Kill This Love - BLACKPINK',
  'Pink Venom - BLACKPINK',
  'Shut Down - BLACKPINK',
  "As If It's Your Last - BLACKPINK",
  'Boombayah - BLACKPINK',
  'Lovesick Girls - BLACKPINK',
  'TT - TWICE',
  'Fancy - TWICE',
  'What Is Love? - TWICE',
  'The Feels - TWICE',
  'Cheer Up - TWICE',
  'Next Level - aespa',
  'Savage - aespa',
  'Spicy - aespa',
  'Love Dive - IVE',
  'After Like - IVE',
  'I AM - IVE',
  'Antifragile - LE SSERAFIM',
  'Ditto - NewJeans',
  'Hype Boy - NewJeans',
  'Super Shy - NewJeans',
  'Tomboy - (G)I-DLE',
  'Queencard - (G)I-DLE',
  'Wannabe - ITZY',
  "God's Menu - Stray Kids",
  'Love Shot - EXO',
  'Psycho - Red Velvet',
  'Fantastic Baby - BIGBANG',
  'Gee - Girls’ Generation',
  'Good Day - IU',
]

/** Ein wählbares Preset im Offline-Modus. */
export interface KaraokePreset {
  id: 'top100' | 'de' | 'kpop'
  emoji: string
  songs: string[]
}

export const KARAOKE_PRESETS: KaraokePreset[] = [
  { id: 'top100', emoji: '🌍', songs: KARAOKE_TOP_100 },
  { id: 'de', emoji: '🇩🇪', songs: KARAOKE_DE },
  { id: 'kpop', emoji: '🇰🇷', songs: KARAOKE_KPOP },
]
