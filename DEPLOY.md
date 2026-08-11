# 📱 Karaoke Roulette aufs Handy bringen (Deployment via Vercel)

Die App ist rein clientseitig (kein Backend, kein Secret) und lässt sich
**kostenlos** auf Vercel hosten. Danach läuft sie mit einer festen HTTPS-URL
auf **jedem** Handy – einfach die URL im Browser öffnen oder zum Startbildschirm
hinzufügen.

> Wichtig: Die lokale Adresse `http://127.0.0.1:5173` funktioniert **nur auf dem
> PC selbst**. Fürs Handy braucht es eine öffentliche HTTPS-Adresse – genau das
> liefert Vercel.

---

## Schritt 1 – Projekt bei Vercel importieren

1. Auf **[vercel.com](https://vercel.com)** mit deinem **GitHub-Account** anmelden
   (kostenlos, „Hobby"-Plan reicht).
2. **„Add New…“ → „Project“** klicken.
3. Das Repository **`Karaoke-Roulette`** auswählen und **„Import“** klicken.
4. Vercel erkennt **Vite** automatisch:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`

   Diese Werte einfach so lassen.

## Schritt 2 – Umgebungsvariable setzen

Vor dem ersten Deploy im Import-Dialog (oder später unter **Settings →
Environment Variables**) **eine** Variable anlegen:

| Name | Wert |
|------|------|
| `VITE_SPOTIFY_CLIENT_ID` | deine Spotify Client-ID (aus dem Dashboard) |

> **Die Redirect-URI musst du hier NICHT setzen.** Ist sie leer, wählt die App
> automatisch `https://<deine-vercel-domain>/callback` – passt also von selbst
> zur Vercel-Adresse.

Dann **„Deploy“** klicken. Nach ~1 Minute bekommst du eine URL wie:

```
https://karaoke-roulette-abc123.vercel.app
```

(Unter **Settings → Domains** kannst du sie umbenennen, z. B.
`https://karaoke-roulette-vince.vercel.app`.)

## Schritt 3 – Redirect-URI bei Spotify eintragen

Damit der Login funktioniert, muss Spotify die neue Adresse kennen:

1. **[Spotify Developer Dashboard](https://developer.spotify.com/dashboard)** →
   deine App → **Settings** → **Redirect URIs** → **„Edit“**.
2. Deine Vercel-URL **mit `/callback` am Ende** hinzufügen, exakt so (HTTPS!):
   ```
   https://DEINE-VERCEL-ADRESSE.vercel.app/callback
   ```
3. **Save**.

> Die alte `http://127.0.0.1:5173/callback` kann für die lokale Entwicklung
> ruhig zusätzlich eingetragen bleiben – Spotify erlaubt mehrere Redirect-URIs.

## Schritt 4 – Am Handy öffnen 🎉

1. Auf dem Handy die Vercel-URL im Browser öffnen.
2. **„Mit Spotify verbinden“** → Zugriff bestätigen → Playlist wählen → losdrehen.
3. Optional: über das Browser-Menü **„Zum Startbildschirm hinzufügen“** – dann
   startet Karaoke Roulette wie eine echte App im Vollbild.

---

## Aktualisieren

Jeder `git push` auf den Branch löst bei Vercel automatisch ein neues Deployment
aus. Nichts weiter zu tun – kurz warten, dann am Handy `Neu laden`.

## Häufige Stolpersteine

- **„INVALID_CLIENT: Invalid redirect URI“** → Die Vercel-URL ist bei Spotify
  nicht (oder mit Tippfehler / ohne `/callback` / als `http` statt `https`)
  eingetragen. Muss **exakt** übereinstimmen.
- **Login-/Zugriffs-Fehler** → Dein Spotify-Konto muss im Dashboard unter
  **User Management** freigeschaltet sein (Development Mode).
- **Songs laden nicht (403)** → Nur **eigene** Playlists sind ladbar (seit der
  Spotify-Migration Feb. 2026). Siehe `README.md` → Troubleshooting.
