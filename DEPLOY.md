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

## 👥 Gast-Modus – Freunde rollen ohne eigenen Spotify-Login

Im **Development Mode** kannst du nur wenige Personen freischalten. Damit
Freunde trotzdem mitspielen können, ohne sich selbst mit Spotify zu verbinden,
gibt es einen **Gast-Modus**. Er erscheint als Button „Ohne Login starten“ auf
der Startseite – sobald **eine** der beiden Quellen eingerichtet ist:

### Variante A – Snapshot (empfohlen, kein Secret, zuverlässig)

1. Verbinde dich selbst mit Spotify und öffne deine Karaoke-Playlist.
2. **Einstellungen → „Gast-Playlist exportieren“** → lädt `guest-playlist.json`.
3. Lege die Datei in den Ordner **`public/`** des Projekts:
   `public/guest-playlist.json`
4. `git add . && git commit && git push` → Vercel deployt automatisch.

Fertig: Besucher sehen den Gast-Button und rollen über diese Songs – ganz ohne
Login. Änderst du die Playlist, exportierst du einmal neu und pushst wieder.

### Variante B – Live-Proxy (immer aktuell, braucht dein Client-Secret)

1. In **Vercel → Settings → Environment Variables** setzen:
   - `SPOTIFY_CLIENT_ID` – deine Client-ID
   - `SPOTIFY_CLIENT_SECRET` – dein **Client-Secret** (nur serverseitig, sicher)
   - `VITE_GUEST_PLAYLIST_ID` – ID einer **öffentlichen** Playlist
2. Neu deployen. Die Funktion `/api/guest-playlist` lädt die Playlist live.

> ⚠️ Wegen der Spotify-Migration (Feb. 2026) ist nicht garantiert, dass
> App-Tokens fremde/öffentliche Playlists auslesen dürfen. Klappt der Live-Proxy
> nicht, greift automatisch der Snapshot (Variante A) – richte im Zweifel
> beide ein.

---

## 🔄 Playlist-Konverter – von Melon / YouTube Music nach Spotify

Unter **Playlists → „Playlist konvertieren"** kannst du eine Songliste aus
einer anderen App nach Spotify übertragen:

1. In der Quell-App (Melon, YouTube Music …) die Titel kopieren – **eine Zeile
   pro Song**, z. B. `Dynamite – BTS`. Titel/Interpret dürfen mit `-`, `–` oder
   Tab getrennt sein; die Reihenfolge (Titel–Interpret / Interpret–Titel) lässt
   sich umschalten.
2. Liste einfügen, Namen der neuen Playlist wählen, **„Auf Spotify suchen"**.
3. Die App zeigt zu jedem Song den besten Spotify-Treffer mit **Konfidenz**
   (Sicher / Prüfen / Unsicher). Unsichere abwählen oder einen anderen Treffer
   auswählen.
4. **„Playlist erstellen"** legt die Playlist in deinem Spotify-Konto an – du
   kannst sie danach direkt in Karaoke Roulette verwenden.

> Beim ersten Mal fragt Spotify nach der Berechtigung, Playlists anzulegen.
> Falls du schon verbunden warst: einmal **„Spotify trennen"** und neu
> verbinden, damit die neue Berechtigung greift.

---

## Häufige Stolpersteine

- **„INVALID_CLIENT: Invalid redirect URI“** → Die Vercel-URL ist bei Spotify
  nicht (oder mit Tippfehler / ohne `/callback` / als `http` statt `https`)
  eingetragen. Muss **exakt** übereinstimmen.
- **Login-/Zugriffs-Fehler** → Dein Spotify-Konto muss im Dashboard unter
  **User Management** freigeschaltet sein (Development Mode).
- **Songs laden nicht (403)** → Nur **eigene** Playlists sind ladbar (seit der
  Spotify-Migration Feb. 2026). Siehe `README.md` → Troubleshooting.
