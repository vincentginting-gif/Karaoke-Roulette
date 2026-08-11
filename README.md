# 🎤 Karaoke Roulette

Eine moderne, minimalistische Web-App, die **zufällig einen Song aus einer deiner
Spotify-Playlists** auswählt und die Auswahl mit einer spannenden
Case-Opening-artigen **Roulette-Animation** präsentiert.

> App öffnen → Spotify verbinden → Playlist wählen → **SONG AUSWÄHLEN** → Roulette →
> Cover + Titel + Artist → **AUF SPOTIFY ÖFFNEN** → singen. 🎶

---

## ✨ Features

- **Spotify-Login** via Authorization Code Flow **mit PKCE** – komplett im Browser,
  **kein Backend, kein Client Secret**.
- **Playlist-Auswahl** aus deinen eigenen Spotify-Playlists (mit Cover & Songzahl).
- **Deterministische Roulette-Animation** (~5 s, 60 fps): Der Gewinner steht *vor*
  dem Start fest, die Animation läuft sanft (Quintic-Ease-Out) darauf zu und landet
  exakt unter dem Marker – unabhängig von Frame-Rate oder Timing.
- **Ergebnis-Screen** mit großem Cover, Titel, Artist und Button *Auf Spotify öffnen*.
- **Keine Wiederholung:** bereits gezogene Songs werden vermieden; sind alle einmal
  dran gewesen, wird der Pool automatisch zurückgesetzt. Zustand liegt **persistent
  im `localStorage`** (pro Playlist).
- **Dezente Sound- & Haptik-Effekte** (abschaltbar), respektiert
  `prefers-reduced-motion`.
- Robuste **Fehlerbehandlung** (keine Verbindung, Auth fehlgeschlagen, leere Playlist,
  fehlendes Cover, Netzwerkfehler …).
- **Responsive** für Desktop und Mobile.

Bewusst **nicht** enthalten (persönlicher MVP): keine fremden Benutzerkonten, kein
Multiplayer, keine Punkte/Leaderboards, **keine eigene Musik-Wiedergabe**.

---

## 🧱 Tech-Stack

- **Vite + React + TypeScript** – schlanke SPA, keine Server-Komponente.
- **Spotify Web API** + **OAuth (PKCE)** – rein client-seitig.
- **Web Audio API** für die dezenten Tick-/Stop-Sounds (keine Audio-Assets).

### Projektstruktur (sauber getrennt)

```
src/
├── spotify/
│   ├── auth.ts        # OAuth (PKCE), Token-Handling, Refresh
│   ├── api.ts         # Web-API-Calls (Playlists, Tracks)
│   └── types.ts       # Domain-Typen
├── storage/
│   └── storage.ts     # localStorage (aktive Playlist + gezogene Songs)
├── roulette/
│   ├── engine.ts      # Gewinner-Auswahl + No-Repeat-Logik + Strip-Aufbau
│   ├── easing.ts      # Easing-Kurve
│   └── audio.ts       # Sound-/Haptik-Feedback
├── hooks/
│   └── useAuth.ts     # Auth-Zustand + Callback-Handling
├── components/        # UI (Home, PlaylistPicker, Roulette, Result, …)
├── styles/global.css  # Design (dunkel, Duotone-Neon)
└── App.tsx            # Orchestrierung / Screen-Flow
```

---

## 🚀 Schnellstart

```bash
# 1. Abhängigkeiten installieren
npm install

# 2. Umgebungsvariablen anlegen
cp .env.example .env
#    -> .env öffnen und VITE_SPOTIFY_CLIENT_ID eintragen (siehe unten)

# 3. Dev-Server starten
npm run dev
#    -> http://127.0.0.1:5173  öffnen
```

Weitere Befehle:

```bash
npm run build      # Produktions-Build nach dist/
npm run preview    # Build lokal ansehen
npm run typecheck  # TypeScript prüfen
```

---

## 🔐 Spotify Setup (einmalig, ~3 Minuten)

Diese App braucht **nur eine Client-ID** – **kein** Client Secret.

### Schritt 1 – App im Spotify Developer Dashboard anlegen

1. Öffne das **[Spotify Developer Dashboard](https://developer.spotify.com/dashboard)**
   und melde dich mit deinem normalen Spotify-Account an.
2. Klicke auf **„Create app“**.
3. Fülle aus:
   - **App name:** z. B. `Karaoke Roulette`
   - **App description:** beliebig
   - **Redirect URI:** genau diesen Wert eintragen und **„Add“** klicken:
     ```
     http://127.0.0.1:5173/callback
     ```
     > ⚠️ Wichtig: Spotify verlangt für lokale Entwicklung **`127.0.0.1`**,
     > **nicht** `localhost`. Der Wert muss exakt mit dem in deiner `.env`
     > übereinstimmen.
   - **Which API/SDKs are you planning to use?** → **Web API** ankreuzen.
4. Speichern.

### Schritt 2 – Client-ID kopieren

1. Öffne deine App → **Settings**.
2. Kopiere die **Client ID**.

### Schritt 3 – Werte in die `.env` eintragen

Trage die kopierte Client-ID in deine `.env` ein:

```dotenv
VITE_SPOTIFY_CLIENT_ID=deine_client_id_hier

# Muss exakt der Redirect-URI aus dem Dashboard entsprechen:
VITE_SPOTIFY_REDIRECT_URI=http://127.0.0.1:5173/callback
```

**Das sind alle Werte, die du eintragen musst.** Kein Client Secret, keine weiteren
Keys.

### Schritt 4 – Dev-Server (neu) starten

```bash
npm run dev
```

Öffne **http://127.0.0.1:5173**, klicke auf **„Mit Spotify verbinden“**, bestätige den
Zugriff, wähle eine Playlist – fertig. 🎉

---

## ℹ️ Wichtige Spotify-Einschränkung (bitte lesen)

Neu erstellte Spotify-Apps befinden sich zunächst im **„Development Mode“**. In diesem
Modus kann die App **nur von Nutzern verwendet werden, die du im Dashboard manuell
freischaltest** (bis zu 25).

**Für diese persönliche App ist das genau richtig** – aber je nach Account kann es
sein, dass du dich einmalig selbst hinzufügen musst:

> Dashboard → deine App → **User Management** → deinen eigenen Spotify-Namen und die
> zu deinem Account gehörende **E-Mail** eintragen → speichern.

Falls der Login mit einem Zugriffs-Fehler abbricht, ist das fast immer die Ursache.
Es ist bewusst **keine** kompliziertere Lösung eingebaut, da dies für eine persönliche
MVP-App der einfachste und offizielle Weg ist.

### Abgefragte Berechtigungen (Scopes)

Nur **Lesezugriff** auf deine Playlists:

- `playlist-read-private`
- `playlist-read-collaborative`

Es werden **keine** Wiedergabe-Rechte und **keine** Schreibrechte angefragt.

---

## 🎡 Wie die Roulette-Animation funktioniert

1. **Vor** der Animation wird der Gewinner bestimmt (`roulette/engine.ts`), unter
   Berücksichtigung der bereits gezogenen Songs.
2. Ein Karten-Strip wird gebaut; der Gewinner sitzt an einer festen Position.
3. Die Animation (`components/Roulette.tsx`) berechnet die Ziel-Verschiebung, die den
   Gewinner exakt unter dem Marker zentriert, und fährt per `requestAnimationFrame`
   mit einer **Quintic-Ease-Out**-Kurve (schnell → langsam → STOP) über ~5 s dorthin.

Weil die Position aus der **verstrichenen Zeit** berechnet wird (nicht aus
Frame-Inkrementen), landet **immer derselbe, vorher bestimmte Song** – unabhängig von
der Bildwiederholrate. Ein winziger Versatz (< halbe Karte) sorgt dafür, dass der Stop
lebendig statt steril wirkt.

---

## 🛠️ Troubleshooting

### 403 „Forbidden“ beim Laden der Songs

Hintergrund: Mit der **Spotify-API-Migration (Feb. 2026)** wurde der alte Endpoint
`GET /playlists/{id}/tracks` **entfernt** (liefert 403) und durch
`GET /playlists/{id}/items` ersetzt. Diese App nutzt bereits den neuen Endpoint.

Wichtige Einschränkung seit der Migration: Playlist-**Inhalte** gibt es nur noch für
Playlists, die **dir selbst gehören** (oder bei denen du Mitbearbeiter bist). Fremde
Playlists – auch solche, denen du nur folgst, sowie von Spotify erstellte
(Discover Weekly, Daily Mix, Editorial) – liefern **403**.

**Lösung:** Wähle eine Playlist, die **du selbst erstellt** hast. Im Playlist-Picker
stehen deine eigenen Listen oben; fremde/Spotify-Listen sind mit einem grünen
**„Spotify“**-Badge markiert.

> Tipp: Lege in Spotify eine eigene Playlist „Karaoke“ an und füge ein paar Songs
> hinzu – die funktioniert.

### 403 auch bei **eigenen** Playlists

Dann ist dein Account vermutlich noch nicht für die App freigeschaltet
(Development Mode). Im **[Dashboard](https://developer.spotify.com/dashboard)** →
deine App → **User Management** → deinen Spotify-Namen + E-Mail hinzufügen, dann in der
App **„Spotify trennen“** und neu verbinden.

> Die Browser-Konsole (F12) zeigt bei API-Fehlern die genaue URL und Antwort von
> Spotify – hilfreich zur Eingrenzung.

---

## 🗃️ Datenspeicherung

Alles bleibt lokal im Browser (`localStorage`):

- zuletzt gewählte Playlist,
- Liste der bereits gezogenen Songs (pro Playlist),
- Spotify-Tokens (Access/Refresh),
- Sound-Einstellung.

Es werden **keine** Daten an Dritte gesendet – nur direkt an die Spotify-API.
