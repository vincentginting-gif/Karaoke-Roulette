// ─────────────────────────────────────────────────────────────
//  Kuratierte Genres fuer den Entdecken-Modus.
//  `query` ist der Begriff fuer den Spotify-Genre-Suchfilter.
// ─────────────────────────────────────────────────────────────

export interface Genre {
  label: string
  query: string
  emoji: string
}

export const GENRES: Genre[] = [
  { label: 'Pop', query: 'pop', emoji: '🎤' },
  { label: 'HipHop / Rap', query: 'hip hop', emoji: '🎧' },
  { label: 'Rock', query: 'rock', emoji: '🎸' },
  { label: 'Jazz', query: 'jazz', emoji: '🎷' },
  { label: 'Electronic', query: 'electronic', emoji: '🎛️' },
  { label: 'R&B / Soul', query: 'r&b', emoji: '💜' },
  { label: 'Latin', query: 'latin', emoji: '💃' },
  { label: 'Metal', query: 'metal', emoji: '🤘' },
  { label: 'Country', query: 'country', emoji: '🤠' },
  { label: 'Indie', query: 'indie', emoji: '🌙' },
  { label: 'Schlager', query: 'schlager', emoji: '🍻' },
  { label: 'K-Pop', query: 'k-pop', emoji: '✨' },
]
