// Vercel Serverless Function – lädt die Tracks einer öffentlichen Spotify-
// Playlist über den Client-Credentials-Flow (App-Token, ohne Nutzer-Login).
// Dadurch können Gäste rollen, ohne sich selbst mit Spotify zu verbinden.
//
// Benötigte Environment-Variablen (in Vercel → Settings → Environment Variables):
//   SPOTIFY_CLIENT_ID       – deine Spotify Client-ID
//   SPOTIFY_CLIENT_SECRET   – dein Spotify Client-Secret (NUR serverseitig!)
// Und im Frontend (VITE_...):
//   VITE_GUEST_PLAYLIST_ID  – ID der öffentlichen Playlist für den Gast-Modus

let tokenCache = { token: null, exp: 0 }

async function getToken() {
  const now = Date.now()
  if (tokenCache.token && now < tokenCache.exp) return tokenCache.token

  const id = process.env.SPOTIFY_CLIENT_ID
  const secret = process.env.SPOTIFY_CLIENT_SECRET
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64'),
    },
    body: 'grant_type=client_credentials',
  })
  if (!res.ok) throw new Error(`token ${res.status}`)
  const data = await res.json()
  tokenCache = { token: data.access_token, exp: now + (data.expires_in - 60) * 1000 }
  return tokenCache.token
}

function mapTrack(t) {
  if (!t || !t.id || t.is_local || t.type === 'episode') return null
  const img = (t.album && t.album.images && t.album.images[0] && t.album.images[0].url) || null
  return {
    id: t.id,
    title: t.name || 'Unbekannter Titel',
    artist:
      (t.artists || [])
        .map((a) => a.name)
        .filter(Boolean)
        .join(', ') || 'Unbekannter Artist',
    coverUrl: img,
    spotifyUrl: (t.external_urls && t.external_urls.spotify) || `https://open.spotify.com/track/${t.id}`,
    album: (t.album && t.album.name) || '',
    durationMs: t.duration_ms || 0,
  }
}

export default async function handler(req, res) {
  const id = (req.query.id || '').toString()
  if (!id) return res.status(400).json({ error: 'missing id' })
  if (!process.env.SPOTIFY_CLIENT_SECRET) {
    return res.status(501).json({ error: 'guest proxy not configured' })
  }

  try {
    const token = await getToken()

    let name = 'Karaoke'
    const meta = await fetch(`https://api.spotify.com/v1/playlists/${id}?fields=name`, {
      headers: { Authorization: 'Bearer ' + token },
    })
    if (meta.ok) name = (await meta.json()).name || name

    const tracks = []
    let url = `https://api.spotify.com/v1/playlists/${id}/tracks?limit=100`
    while (url) {
      const r = await fetch(url, { headers: { Authorization: 'Bearer ' + token } })
      if (!r.ok) return res.status(r.status).json({ error: `spotify ${r.status}` })
      const page = await r.json()
      for (const item of page.items || []) {
        const m = mapTrack(item && item.track)
        if (m) tracks.push(m)
      }
      url = page.next
    }

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    return res.status(200).json({ name, tracks })
  } catch (e) {
    return res.status(500).json({ error: String(e && e.message ? e.message : e) })
  }
}
