// Vercel Serverless Function – Album-Cover-Proxy.
// Fragt die iTunes Search API SERVERSEITIG ab und liefert eine Cover-URL.
// Vorteil: Der Browser redet nur mit der eigenen App (kein CORS-Problem,
// kein Adblocker auf Apple-Domains, verlässliche Erreichbarkeit). Kein
// API-Key nötig. Bild wird anschließend direkt vom CDN (mzstatic) geladen.

export default async function handler(req, res) {
  const title = (req.query.title || '').toString().trim()
  const artist = (req.query.artist || '').toString().trim()
  if (!title) return res.status(400).json({ error: 'missing title' })

  const term = encodeURIComponent(`${title} ${artist}`.trim())
  try {
    const r = await fetch(
      `https://itunes.apple.com/search?term=${term}&entity=song&limit=1`,
    )
    if (!r.ok) {
      // iTunes-Fehler -> „gefunden: nichts", aber Anfrage war ok (ok:true),
      // damit der Client nicht direkt selbst noch mal iTunes anfragt.
      return res.status(200).json({ ok: true, cover: null })
    }
    const data = await r.json()
    const art = data && data.results && data.results[0] && data.results[0].artworkUrl100
    const cover = art ? art.replace('100x100bb', '600x600bb') : null

    // Lange cachen (Cover ändern sich praktisch nie).
    res.setHeader('Cache-Control', 's-maxage=604800, stale-while-revalidate=86400')
    return res.status(200).json({ ok: true, cover })
  } catch (e) {
    return res.status(200).json({ ok: true, cover: null })
  }
}
