// ─────────────────────────────────────────────────────────────
//  Übersetzungen (Deutsch / English / 한국어)
//  Flache Schlüssel; {platzhalter} werden von t() ersetzt.
// ─────────────────────────────────────────────────────────────

export type Lang = 'de' | 'en' | 'ko'

export const LANGS: { code: Lang; label: string; abbr: string; flag: string }[] = [
  { code: 'de', label: 'Deutsch', abbr: 'De', flag: '🇩🇪' },
  { code: 'en', label: 'English', abbr: 'En', flag: '🇬🇧' },
  { code: 'ko', label: '한국어', abbr: 'Ko', flag: '🇰🇷' },
]

type Entry = Record<Lang, string>

export const translations: Record<string, Entry> = {
  // ── Allgemein ──
  'brand.subtitle': {
    de: 'Lass den Zufall entscheiden, was du heute singst.',
    en: 'Let chance decide what you sing today.',
    ko: '오늘 부를 노래를 운에 맡겨보세요.',
  },
  'common.back': { de: 'Zurück', en: 'Back', ko: '뒤로' },
  'common.toPlaylists': { de: 'Zu Playlists', en: 'To playlists', ko: '플레이리스트로' },
  'common.done': { de: 'Fertig', en: 'Done', ko: '완료' },
  'common.loading': { de: 'Lädt…', en: 'Loading…', ko: '불러오는 중…' },
  'common.add': { de: 'Hinzufügen', en: 'Add', ko: '추가' },
  'common.song': { de: 'Song', en: 'song', ko: '곡' },
  'common.songs': { de: 'Songs', en: 'songs', ko: '곡' },

  // ── Homepage / Welcome ──
  'welcome.intro': {
    de: 'Karaoke Roulette wählt per spannender Case-Opening-Animation zufällig einen Song aus deiner Spotify-Playlist – perfekt, um zu entscheiden, wer als Nächstes was singt.',
    en: 'Karaoke Roulette picks a random song from your Spotify playlist with an exciting case-opening animation – perfect for deciding who sings what next.',
    ko: 'Karaoke Roulette는 케이스 오프닝 스타일 애니메이션으로 Spotify 플레이리스트에서 노래를 무작위로 뽑아줍니다 – 다음에 누가 무엇을 부를지 정하기에 딱 좋아요.',
  },
  'welcome.how': { de: "So funktioniert's", en: 'How it works', ko: '이용 방법' },
  'welcome.step1': {
    de: 'Mit Spotify verbinden und eine Playlist wählen – oder nach Genre, Artist oder Album entdecken.',
    en: 'Connect Spotify and pick a playlist – or discover by genre, artist or album.',
    ko: 'Spotify에 연결하고 플레이리스트를 선택하세요 – 또는 장르·아티스트·앨범으로 찾아보세요.',
  },
  'welcome.step2': {
    de: 'Auf „Spin“ tippen – das Roulette dreht und bleibt auf einem zufälligen Song stehen.',
    en: 'Tap “Spin” – the roulette spins and lands on a random song.',
    ko: '“Spin”을 누르면 룰렛이 돌아 무작위 노래에서 멈춥니다.',
  },
  'welcome.step3': {
    de: 'Den Song auf Spotify oder einer anderen Plattform öffnen und lossingen.',
    en: 'Open the song on Spotify or another platform and start singing.',
    ko: 'Spotify나 다른 플랫폼에서 노래를 열고 노래를 시작하세요.',
  },
  'welcome.start': { de: 'Playlist wählen', en: 'Choose playlist', ko: '플레이리스트 선택' },
  'welcome.guest': {
    de: 'Ohne Login starten (Gast)',
    en: 'Start without login (guest)',
    ko: '로그인 없이 시작 (게스트)',
  },

  // ── Verbinden ──
  'connect.heading': { de: 'Verbinde Spotify', en: 'Connect Spotify', ko: 'Spotify 연결' },
  'connect.text': {
    de: 'Melde dich mit Spotify an, um deine Playlists zu laden. Es wird nur Lesezugriff auf deine Playlists angefragt – keine Wiedergabe, keine Änderungen.',
    en: 'Sign in with Spotify to load your playlists. Only read access to your playlists is requested – no playback, no changes.',
    ko: 'Spotify에 로그인하여 플레이리스트를 불러옵니다. 플레이리스트에 대한 읽기 권한만 요청하며 재생이나 변경은 하지 않습니다.',
  },
  'connect.button': { de: 'Mit Spotify verbinden', en: 'Connect with Spotify', ko: 'Spotify로 연결' },

  // ── Einrichtung fehlt ──
  'config.heading': {
    de: 'Fast fertig – kurze Einrichtung',
    en: 'Almost there – quick setup',
    ko: '거의 다 됐어요 – 간단한 설정',
  },
  'config.text': {
    de: 'Es ist noch keine Spotify Client-ID hinterlegt. So richtest du sie ein:',
    en: 'No Spotify Client ID is set yet. Here is how to set it up:',
    ko: '아직 Spotify 클라이언트 ID가 설정되지 않았습니다. 설정 방법:',
  },
  'config.step1': {
    de: 'Kopiere .env.example zu .env',
    en: 'Copy .env.example to .env',
    ko: '.env.example을 .env로 복사하세요',
  },
  'config.step2pre': {
    de: 'Trage deine VITE_SPOTIFY_CLIENT_ID aus dem',
    en: 'Enter your VITE_SPOTIFY_CLIENT_ID from the',
    ko: '다음에서 VITE_SPOTIFY_CLIENT_ID를 입력하세요:',
  },
  'config.step2post': { de: 'ein', en: '', ko: '' },
  'config.step3': {
    de: 'Hinterlege die Redirect-URI http://127.0.0.1:5173/callback im Dashboard',
    en: 'Add the redirect URI http://127.0.0.1:5173/callback in the dashboard',
    ko: '대시보드에 리디렉션 URI http://127.0.0.1:5173/callback을 등록하세요',
  },
  'config.step4': { de: 'Dev-Server neu starten', en: 'Restart the dev server', ko: '개발 서버를 다시 시작하세요' },
  'config.details': { de: 'Details stehen in der', en: 'Details are in the', ko: '자세한 내용은 다음 참고:' },

  // ── Startseite ──
  'home.spin': { de: 'Spin', en: 'Spin', ko: 'Spin' },
  'home.changePlaylist': { de: 'Playlist wechseln', en: 'Change playlist', ko: '플레이리스트 변경' },
  'home.manageSongs': { de: 'Songs verwalten', en: 'Manage songs', ko: '노래 관리' },
  'home.playlist': { de: 'Playlist', en: 'Playlist', ko: '플레이리스트' },
  'home.change': { de: 'wechseln', en: 'change', ko: '변경' },
  'home.remaining': {
    de: 'Noch {remaining} von {total} {songs} ungezogen',
    en: '{remaining} of {total} {songs} still undrawn',
    ko: '{total}곡 중 {remaining}곡 아직 안 뽑음',
  },
  'home.reset': {
    de: 'Gezogene zurücksetzen ({n})',
    en: 'Reset drawn ({n})',
    ko: '뽑은 노래 초기화 ({n})',
  },

  // ── Playlist-Picker ──
  'picker.title': {
    de: 'Wähle deine Karaoke-Playlist',
    en: 'Choose your karaoke playlist',
    ko: '노래방 플레이리스트를 선택하세요',
  },
  'picker.subtitle': {
    de: 'Aus dieser Playlist wird gezogen.',
    en: 'Songs are drawn from this playlist.',
    ko: '이 플레이리스트에서 노래를 뽑습니다.',
  },
  'picker.genre.title': { de: 'Nach Genre entdecken', en: 'Discover by genre', ko: '장르로 찾기' },
  'picker.genre.hint': {
    de: 'Songs aus ganz Spotify – nach Genre',
    en: 'Songs from all of Spotify – by genre',
    ko: 'Spotify 전체에서 – 장르별',
  },
  'picker.artist.title': { de: 'Nach Artist', en: 'By artist', ko: '아티스트로' },
  'picker.artist.hint': {
    de: 'Zufällige Songs bestimmter Artists',
    en: 'Random songs by specific artists',
    ko: '특정 아티스트의 랜덤 노래',
  },
  'picker.album.title': { de: 'Nach Album', en: 'By album', ko: '앨범으로' },
  'picker.album.hint': {
    de: 'Zufällige Songs aus bestimmten Alben',
    en: 'Random songs from specific albums',
    ko: '특정 앨범의 랜덤 노래',
  },
  'picker.convert.title': { de: 'Playlist konvertieren', en: 'Convert playlist', ko: '플레이리스트 변환' },
  'picker.convert.hint': {
    de: 'Songliste von Melon, YouTube Music & Co. → Spotify',
    en: 'Song list from Melon, YouTube Music & co. → Spotify',
    ko: 'Melon·YouTube Music 등의 목록 → Spotify',
  },
  'picker.import.title': { de: 'Datei importieren', en: 'Import file', ko: '파일 가져오기' },
  'picker.import.hint': {
    de: 'Gespeicherte Songliste (JSON) laden und direkt rollen',
    en: 'Load a saved song list (JSON) and roll right away',
    ko: '저장된 노래 목록(JSON)을 불러와 바로 돌리기',
  },

  // ── Playlist-Konverter ──
  'convert.title': { de: 'Playlist konvertieren', en: 'Convert playlist', ko: '플레이리스트 변환' },
  'convert.subtitle': {
    de: 'Songliste von Melon, YouTube Music & Co. nach Spotify übertragen.',
    en: 'Move a song list from Melon, YouTube Music & co. to Spotify.',
    ko: 'Melon, YouTube Music 등의 노래 목록을 Spotify로 옮기세요.',
  },
  'convert.tip': {
    de: 'Füge deine Songs ein – eine Zeile pro Song, z. B. „Dynamite – BTS“. Titel und Interpret dürfen mit „-“, „–“ oder Tab getrennt sein.',
    en: 'Paste your songs – one per line, e.g. “Dynamite – BTS”. Title and artist may be separated by “-”, “–” or a tab.',
    ko: '노래를 붙여넣으세요 – 한 줄에 한 곡, 예: “Dynamite – BTS”. 제목과 아티스트는 “-”, “–” 또는 탭으로 구분할 수 있어요.',
  },
  'convert.placeholder': {
    de: 'Dynamite – BTS\nBlinding Lights – The Weeknd\nBruno Mars – Marry You, Adele – Hello\n…',
    en: 'Dynamite – BTS\nBlinding Lights – The Weeknd\nBruno Mars – Marry You, Adele – Hello\n…',
    ko: 'Dynamite – BTS\nBlinding Lights – The Weeknd\nBruno Mars – Marry You, Adele – Hello\n…',
  },
  'convert.commaHint': {
    de: 'Mehrere Songs in einer Zeile gehen auch – mit Komma getrennt, z. B. „Bruno Mars – Marry You, Adele – Hello“.',
    en: 'Several songs on one line work too – separated by commas, e.g. “Bruno Mars – Marry You, Adele – Hello”.',
    ko: '한 줄에 여러 곡도 됩니다 – 쉼표로 구분, 예: “Bruno Mars – Marry You, Adele – Hello”.',
  },
  'convert.import': { de: 'Aus Datei importieren', en: 'Import from file', ko: '파일에서 가져오기' },
  'convert.importIntro': {
    de: 'Schon mal konvertiert und als Datei gespeichert?',
    en: 'Converted and saved as a file before?',
    ko: '전에 변환해서 파일로 저장했나요?',
  },
  'convert.importFailed': {
    de: 'Die Datei konnte nicht gelesen werden. Erwartet wird eine gespeicherte „guest-playlist.json“.',
    en: 'Could not read the file. A saved “guest-playlist.json” is expected.',
    ko: '파일을 읽을 수 없습니다. 저장된 “guest-playlist.json”이 필요합니다.',
  },

  // ── Offline-Gäste-Modus (kein Spotify) ──
  'welcome.offline': { de: 'Ohne Spotify: Songs eintippen', en: 'No Spotify: type songs', ko: 'Spotify 없이: 노래 입력' },
  'welcome.offlineHint': {
    de: 'Kein Konto? Einfach Songs & Interpreten eintippen und losdrehen – die Cover werden zufällig vergeben.',
    en: 'No account? Just type songs & artists and spin – covers are assigned randomly.',
    ko: '계정이 없나요? 노래와 아티스트만 입력하고 돌리세요 – 커버는 무작위로 배정됩니다.',
  },
  'picker.offline.title': { de: 'Ohne Spotify eintippen', en: 'Type without Spotify', ko: 'Spotify 없이 입력' },
  'picker.offline.hint': {
    de: 'Songs & Interpreten selbst eintippen und spinnen',
    en: 'Type songs & artists yourself and spin',
    ko: '노래와 아티스트를 직접 입력하고 돌리기',
  },
  'offline.title': { de: 'Ohne Spotify spielen', en: 'Play without Spotify', ko: 'Spotify 없이 플레이' },
  'offline.subtitle': {
    de: 'Songs & Interpreten eintippen und sofort spinnen – kein Login, keine echten Cover.',
    en: 'Type songs & artists and spin right away – no login, no real covers.',
    ko: '노래와 아티스트를 입력하고 바로 돌리세요 – 로그인도, 실제 커버도 필요 없어요.',
  },
  'offline.tip': {
    de: 'Eine Zeile pro Song, z. B. „Marry You – Bruno Mars“. Jeder Song bekommt zufällig eines der vier Cover-Bilder.',
    en: 'One song per line, e.g. “Marry You – Bruno Mars”. Each song gets one of the four cover images at random.',
    ko: '한 줄에 한 곡, 예: “Marry You – Bruno Mars”. 각 곡은 네 개의 커버 이미지 중 하나를 무작위로 받습니다.',
  },
  'offline.placeholder': {
    de: 'Marry You – Bruno Mars\nRisk It All – Bruno Mars\nHello – Adele\n…',
    en: 'Marry You – Bruno Mars\nRisk It All – Bruno Mars\nHello – Adele\n…',
    ko: 'Marry You – Bruno Mars\nRisk It All – Bruno Mars\nHello – Adele\n…',
  },
  'offline.nameLabel': { de: 'Name der Runde', en: 'Round name', ko: '라운드 이름' },
  'offline.namePlaceholder': { de: 'Karaoke-Party', en: 'Karaoke party', ko: '노래방 파티' },
  'offline.defaultName': { de: 'Karaoke-Party', en: 'Karaoke party', ko: '노래방 파티' },
  'offline.start': { de: 'Los spinnen', en: 'Start spinning', ko: '돌리기 시작' },
  'offline.presetsIntro': {
    de: 'Keine Idee? Fertige Listen laden (anhängbar):',
    en: 'No idea? Load ready-made lists (stackable):',
    ko: '아이디어가 없나요? 준비된 목록 불러오기 (추가 가능):',
  },
  'offline.preset.top100': { de: 'Top {n} International', en: 'Top {n} International', ko: '인기 {n} 인터내셔널' },
  'offline.preset.de': { de: 'Deutsche Hits ({n})', en: 'German hits ({n})', ko: '독일 히트 ({n})' },
  'offline.preset.kpop': { de: 'K-Pop ({n})', en: 'K-Pop ({n})', ko: 'K-팝 ({n})' },
  'offline.preset.disney': { de: 'Disney ({n})', en: 'Disney ({n})', ko: '디즈니 ({n})' },
  'offline.preset.retro': { de: '90er/2000er ({n})', en: '90s/2000s ({n})', ko: '90·2000년대 ({n})' },
  'offline.preset.latino': { de: 'Latino ({n})', en: 'Latino ({n})', ko: '라티노 ({n})' },

  'result.search': { de: 'Auf Spotify suchen', en: 'Search on Spotify', ko: 'Spotify에서 검색' },
  'convert.textareaLabel': { de: 'Songliste', en: 'Song list', ko: '노래 목록' },
  'convert.order': { de: 'Reihenfolge pro Zeile', en: 'Order per line', ko: '줄당 순서' },
  'convert.orderTitleFirst': { de: 'Titel – Interpret', en: 'Title – Artist', ko: '제목 – 아티스트' },
  'convert.orderArtistFirst': { de: 'Interpret – Titel', en: 'Artist – Title', ko: '아티스트 – 제목' },
  'convert.nameLabel': { de: 'Name der neuen Playlist', en: 'New playlist name', ko: '새 플레이리스트 이름' },
  'convert.parsedCount': { de: '{n} Songs erkannt', en: '{n} songs detected', ko: '{n}곡 인식됨' },
  'convert.search': { de: 'Auf Spotify suchen', en: 'Search on Spotify', ko: 'Spotify에서 검색' },
  'convert.matching': {
    de: 'Suche Treffer… {done}/{total}',
    en: 'Finding matches… {done}/{total}',
    ko: '일치 항목 검색 중… {done}/{total}',
  },
  'convert.included': {
    de: '{n} von {total} werden übernommen',
    en: '{n} of {total} will be added',
    ko: '{total}곡 중 {n}곡 추가됨',
  },
  'convert.confidence.high': { de: 'Sicher', en: 'Strong', ko: '확실' },
  'convert.confidence.medium': { de: 'Prüfen', en: 'Check', ko: '확인' },
  'convert.confidence.low': { de: 'Unsicher', en: 'Weak', ko: '불확실' },
  'convert.confidence.none': { de: 'Kein Treffer', en: 'No match', ko: '없음' },
  'convert.noMatch': { de: 'Kein Treffer auf Spotify', en: 'No match on Spotify', ko: 'Spotify에 일치 항목 없음' },
  'convert.swapped': {
    de: 'Reihenfolge automatisch korrigiert (Titel/Interpret vertauscht)',
    en: 'Order auto-corrected (title/artist swapped)',
    ko: '순서 자동 교정됨 (제목/아티스트 바뀜)',
  },
  'convert.otherMatches': { de: 'Andere Treffer', en: 'Other matches', ko: '다른 결과' },
  'convert.create': { de: 'Playlist erstellen ({n})', en: 'Create playlist ({n})', ko: '플레이리스트 만들기 ({n})' },
  'convert.creating': { de: 'Erstelle Playlist…', en: 'Creating playlist…', ko: '플레이리스트 생성 중…' },
  'convert.doneTitle': { de: 'Fertig!', en: 'Done!', ko: '완료!' },
  'convert.doneText': {
    de: '„{name}“ wurde mit {n} Songs erstellt.',
    en: '“{name}” was created with {n} songs.',
    ko: '“{name}” 플레이리스트가 {n}곡으로 생성되었습니다.',
  },
  'convert.useHere': { de: 'Hier direkt verwenden', en: 'Use it here', ko: '여기서 바로 사용' },
  'convert.openSpotify': { de: 'In Spotify öffnen', en: 'Open in Spotify', ko: 'Spotify에서 열기' },
  'convert.restart': { de: 'Neue Konvertierung', en: 'New conversion', ko: '새 변환' },
  'convert.emptyInput': { de: 'Bitte zuerst eine Songliste einfügen.', en: 'Please paste a song list first.', ko: '먼저 노래 목록을 붙여넣으세요.' },
  'convert.nothingSelected': { de: 'Keine Songs ausgewählt.', en: 'No songs selected.', ko: '선택된 노래가 없습니다.' },
  'convert.searchFailed': { de: 'Die Suche ist fehlgeschlagen.', en: 'The search failed.', ko: '검색에 실패했습니다.' },
  'convert.createFailed': { de: 'Playlist konnte nicht erstellt werden.', en: 'Could not create the playlist.', ko: '플레이리스트를 만들 수 없습니다.' },
  'convert.noUser': { de: 'Spotify-Konto nicht erkannt. Bitte neu verbinden.', en: 'Spotify account not detected. Please reconnect.', ko: 'Spotify 계정을 확인할 수 없습니다. 다시 연결하세요.' },

  // ── Konverter – Erklärungen (Eingabe) ──
  'convert.help.title': { de: "So funktioniert's", en: 'How it works', ko: '이용 방법' },
  'convert.help.1': {
    de: 'In deiner App (Melon, YouTube Music …) die Songs markieren und kopieren.',
    en: 'In your app (Melon, YouTube Music …) select and copy the songs.',
    ko: '앱(Melon, YouTube Music 등)에서 노래를 선택해 복사하세요.',
  },
  'convert.help.2': {
    de: 'Hier einfügen – eine Zeile pro Song, z. B. „Dynamite – BTS“.',
    en: 'Paste them here – one song per line, e.g. “Dynamite – BTS”.',
    ko: '여기에 붙여넣으세요 – 한 줄에 한 곡, 예: “Dynamite – BTS”.',
  },
  'convert.help.3': {
    de: 'Auf „Auf Spotify suchen“ tippen. Jeder Song wird bei Spotify gesucht und der beste Treffer angezeigt.',
    en: 'Tap “Search on Spotify”. Each song is looked up on Spotify and the best match is shown.',
    ko: '“Spotify에서 검색”을 누르세요. 각 곡을 Spotify에서 찾아 가장 잘 맞는 결과를 보여줍니다.',
  },
  'convert.help.4': {
    de: 'Treffer prüfen und „Playlist erstellen“ – fertig ist deine Spotify-Playlist.',
    en: 'Check the matches and “Create playlist” – your Spotify playlist is ready.',
    ko: '결과를 확인하고 “플레이리스트 만들기” – Spotify 플레이리스트 완성.',
  },
  'convert.permNote': {
    de: 'Danach kannst du die gefundenen Songs sofort „Direkt hier rollen“ – ganz ohne Spotify-Playlist. (Eine echte Spotify-Playlist anzulegen ist mit privaten Apps nicht mehr möglich, dazu unten mehr.)',
    en: 'Afterwards you can “Roll here directly” with the found songs – no Spotify playlist needed. (Creating a real Spotify playlist is no longer possible with personal apps – more below.)',
    ko: '그다음 찾은 노래로 바로 “여기서 돌리기”를 할 수 있어요 – Spotify 플레이리스트 없이도. (개인 앱으로는 실제 Spotify 플레이리스트 생성이 더 이상 불가능합니다.)',
  },
  'convert.writeNote': {
    de: 'Hinweis: Eine echte Spotify-Playlist kann diese App nicht mehr anlegen – Spotify erlaubt privaten Apps (Development Mode) seit Ende 2024 keinen Schreibzugriff mehr. Kein Problem: Mit „Direkt hier rollen“ nutzt du die Songs sofort im Roulette, und mit „Als Datei speichern“ sicherst du sie (auch für den Gast-Modus).',
    en: 'Note: this app can no longer create a real Spotify playlist – since late 2024 Spotify blocks write access for personal apps (Development Mode). No problem: “Roll here directly” uses the songs right away, and “Save as file” backs them up (also for guest mode).',
    ko: '참고: 이 앱은 더 이상 실제 Spotify 플레이리스트를 만들 수 없습니다 – 2024년 말부터 Spotify가 개인 앱(Development Mode)의 쓰기 접근을 차단합니다. 괜찮아요: “여기서 돌리기”로 노래를 바로 사용하고, “파일로 저장”으로 백업하세요 (게스트 모드용으로도).',
  },
  'convert.useHereTracks': { de: 'Direkt hier rollen ({n})', en: 'Roll here directly ({n})', ko: '여기서 바로 돌리기 ({n})' },
  'convert.exportJson': { de: 'Als Datei speichern', en: 'Save as file', ko: '파일로 저장' },
  'convert.createSpotify': { de: 'Auf Spotify anlegen', en: 'Create on Spotify', ko: 'Spotify에 만들기' },
  'convert.createSpotifyHint': {
    de: 'nur mit Firmen-Zugang',
    en: 'business access only',
    ko: '기업 액세스 전용',
  },
  'convert.orderHint': {
    de: 'Keine Sorge – die Reihenfolge wird automatisch erkannt. Dieser Schalter hilft nur bei kniffligen Fällen.',
    en: "Don't worry – the order is detected automatically. This switch only helps in tricky cases.",
    ko: '걱정 마세요 – 순서는 자동으로 인식됩니다. 이 스위치는 까다로운 경우에만 도움이 됩니다.',
  },

  // ── Konverter – Legende (Prüfen) ──
  'convert.legend.title': { de: 'Was bedeuten die Markierungen?', en: 'What do the labels mean?', ko: '표시의 의미는?' },
  'convert.legend.high': {
    de: 'Sicher – sehr wahrscheinlich der richtige Song, automatisch ausgewählt.',
    en: 'Strong – very likely the right song, selected automatically.',
    ko: '확실 – 거의 확실히 맞는 곡, 자동 선택됨.',
  },
  'convert.legend.medium': {
    de: 'Prüfen – wahrscheinlich richtig, schau kurz drüber. Ist ebenfalls ausgewählt.',
    en: 'Check – probably right, give it a quick look. Also selected.',
    ko: '확인 – 아마 맞음, 한번 확인하세요. 역시 선택됨.',
  },
  'convert.legend.low': {
    de: 'Unsicher – schwacher Treffer, standardmäßig NICHT ausgewählt. Bei Bedarf selbst anhaken.',
    en: 'Weak – poor match, NOT selected by default. Tick it yourself if it fits.',
    ko: '불확실 – 약한 결과, 기본적으로 선택 안 됨. 맞으면 직접 체크하세요.',
  },
  'convert.legend.none': {
    de: 'Kein Treffer – Spotify hat nichts gefunden (siehe Diagnose, was gesucht wurde).',
    en: 'No match – Spotify found nothing (see Diagnostics for what was searched).',
    ko: '없음 – Spotify가 찾지 못함 (검색 내용은 진단 참조).',
  },
  'convert.legend.swap': {
    de: '↔ – Titel und Interpret waren vertauscht und wurden automatisch korrigiert.',
    en: '↔ – title and artist were swapped and got auto-corrected.',
    ko: '↔ – 제목과 아티스트가 바뀌어 자동 교정되었습니다.',
  },
  'convert.legend.check': {
    de: 'Häkchen – bestimmt, ob der Song in die neue Playlist kommt.',
    en: 'Checkbox – decides whether the song goes into the new playlist.',
    ko: '체크박스 – 곡을 새 플레이리스트에 넣을지 결정합니다.',
  },
  'convert.legend.alts': {
    de: '„Andere Treffer“ – zeigt weitere Kandidaten; tippe einen an, um ihn stattdessen zu nehmen.',
    en: '“Other matches” – shows more candidates; tap one to use it instead.',
    ko: '“다른 결과” – 다른 후보를 보여줍니다; 눌러서 대신 선택하세요.',
  },

  // ── Konverter – Diagnose ──
  'convert.debug.show': { de: 'Diagnose', en: 'Diagnostics', ko: '진단' },
  'convert.debug.queries': { de: 'Suchanfragen an Spotify', en: 'Search queries to Spotify', ko: 'Spotify 검색 쿼리' },
  'convert.debug.hits': { de: '{n} Treffer', en: '{n} hits', ko: '{n}개 결과' },
  'convert.debug.zeroHits': { de: '0 Treffer', en: '0 hits', ko: '0개 결과' },
  'convert.debug.scores': { de: 'Bewertete Kandidaten (Titel / Interpret / gesamt)', en: 'Scored candidates (title / artist / total)', ko: '평가된 후보 (제목 / 아티스트 / 합계)' },
  'convert.debug.noCandidates': {
    de: 'Spotify hat für keine Suchanfrage Ergebnisse geliefert – daher 0 %. Der Song existiert vermutlich, aber die Katalog-Suche ist eingeschränkt (siehe Hinweis oben).',
    en: 'Spotify returned no results for any query – hence 0%. The song likely exists, but catalog search is restricted (see note above).',
    ko: '어떤 쿼리에도 Spotify가 결과를 반환하지 않아 0%입니다. 곡은 존재하지만 카탈로그 검색이 제한되어 있습니다 (위 안내 참조).',
  },
  'convert.searchWarning': {
    de: 'Bei {n} von {total} Songs liefert die Spotify-Katalog-Suche keine Treffer. Das ist fast immer die Development-Mode-Einschränkung: Für die volle Suche muss deine Spotify-App den „Extended Quota Mode“ haben (im Developer-Dashboard beantragen). Die perfekt geschriebenen Songs sind also nicht das Problem – die Suche selbst wird gedrosselt.',
    en: 'For {n} of {total} songs Spotify’s catalog search returns nothing. This is almost always the Development Mode restriction: full search needs your Spotify app to have “Extended Quota Mode” (request it in the developer dashboard). The correctly spelled songs aren’t the problem – search itself is throttled.',
    ko: '{total}곡 중 {n}곡에 대해 Spotify 카탈로그 검색이 아무것도 반환하지 않습니다. 이는 거의 항상 Development Mode 제한입니다: 전체 검색을 하려면 Spotify 앱에 “Extended Quota Mode”가 필요합니다 (개발자 대시보드에서 요청). 올바르게 입력된 곡이 문제가 아니라 검색 자체가 제한됩니다.',
  },

  'picker.loading': { de: 'Playlists werden geladen…', en: 'Loading playlists…', ko: '플레이리스트 불러오는 중…' },
  'picker.empty': {
    de: 'Es wurden keine Playlists in deinem Spotify-Konto gefunden.',
    en: 'No playlists were found in your Spotify account.',
    ko: 'Spotify 계정에서 플레이리스트를 찾지 못했습니다.',
  },
  'picker.foreign': {
    de: '{name} – von Spotify erstellt, über die API evtl. nicht ladbar',
    en: '{name} – created by Spotify, may not be loadable via the API',
    ko: '{name} – Spotify 제작, API로 불러오지 못할 수 있음',
  },

  // ── Genre-Picker ──
  'discover.title': { de: 'Nach Genre entdecken', en: 'Discover by genre', ko: '장르로 찾기' },
  'discover.subtitle': {
    de: 'Songs aus ganz Spotify – wähle ein Genre.',
    en: 'Songs from all of Spotify – pick a genre.',
    ko: 'Spotify 전체에서 – 장르를 선택하세요.',
  },
  'discover.loadGenre': { de: '{genre} laden', en: 'Load {genre}', ko: '{genre} 불러오기' },
  'discover.chooseGenre': { de: 'Genre wählen', en: 'Choose a genre', ko: '장르 선택' },

  // ── Artist-/Album-Picker (Chips) ──
  'artist.title': { de: 'Songs nach Artist', en: 'Songs by artist', ko: '아티스트별 노래' },
  'artist.subtitle': {
    de: 'Füge Artists hinzu – gezogen werden zufällige Songs von ihnen.',
    en: 'Add artists – random songs by them will be drawn.',
    ko: '아티스트를 추가하세요 – 해당 아티스트의 랜덤 노래를 뽑습니다.',
  },
  'artist.placeholder': { de: 'Artist eingeben, z. B. Adele', en: 'Enter an artist, e.g. Adele', ko: '아티스트 입력, 예: Adele' },
  'artist.noun': { de: 'Artist', en: 'Artist', ko: '아티스트' },
  'album.title': { de: 'Songs nach Album', en: 'Songs by album', ko: '앨범별 노래' },
  'album.subtitle': {
    de: 'Füge Alben hinzu – gezogen werden zufällige Songs daraus. Interpret angeben, wenn der Albumname mehrdeutig ist.',
    en: 'Add albums – random songs from them will be drawn. Add the artist if the album name is ambiguous.',
    ko: '앨범을 추가하세요 – 해당 앨범의 랜덤 노래를 뽑습니다. 앨범 이름이 모호하면 아티스트를 입력하세요.',
  },
  'album.placeholder': { de: 'Album, z. B. Thriller', en: 'Album, e.g. Thriller', ko: '앨범, 예: Thriller' },
  'album.secondary': { de: 'Interpret (optional)', en: 'Artist (optional)', ko: '아티스트 (선택)' },
  'album.noun': { de: 'Album', en: 'Album', ko: '앨범' },
  'chip.limit': { de: 'Songs pro {noun}', en: 'Songs per {noun}', ko: '{noun}당 노래 수' },
  'chip.all': { de: 'Alle', en: 'All', ko: '전체' },
  'chip.suggestions': { de: 'Vorschläge:', en: 'Suggestions:', ko: '추천:' },
  'chip.load': { de: 'Songs laden ({n})', en: 'Load songs ({n})', ko: '노래 불러오기 ({n})' },
  'chip.addItem': { de: '{noun} hinzufügen', en: 'Add {noun}', ko: '{noun} 추가' },
  'chip.removeItem': { de: '{name} entfernen', en: 'Remove {name}', ko: '{name} 제거' },

  // ── Songs verwalten ──
  'sm.hint': {
    de: 'Tippe auf einen Song, um ihn aus dem Pool zu nehmen (oder zurückzuholen). Entfernte Songs werden beim Roulette nicht mehr gezogen – deine Spotify-Playlist bleibt unberührt.',
    en: 'Tap a song to remove it from the pool (or bring it back). Removed songs are no longer drawn in the roulette – your Spotify playlist stays untouched.',
    ko: '노래를 탭하면 풀에서 제외(또는 복구)됩니다. 제외된 노래는 룰렛에서 뽑히지 않으며 Spotify 플레이리스트는 그대로 유지됩니다.',
  },
  'sm.search': { de: 'In dieser Playlist suchen…', en: 'Search this playlist…', ko: '이 플레이리스트 검색…' },
  'sm.sort': { de: 'Sortieren', en: 'Sort', ko: '정렬' },
  'sm.sort.playlist': { de: 'Playlist-Reihenfolge', en: 'Playlist order', ko: '플레이리스트 순서' },
  'sm.sort.title': { de: 'Titel A–Z', en: 'Title A–Z', ko: '제목 가나다순' },
  'sm.sort.artist': { de: 'Artist A–Z', en: 'Artist A–Z', ko: '아티스트 가나다순' },
  'sm.sort.album': { de: 'Album A–Z', en: 'Album A–Z', ko: '앨범 가나다순' },
  'sm.sort.duration': { de: 'Dauer (kurz → lang)', en: 'Duration (short → long)', ko: '길이 (짧은 → 긴)' },
  'sm.sort.pool': { de: 'Entfernte zuerst', en: 'Removed first', ko: '제외된 것 먼저' },
  'sm.colTitle': { de: 'Titel', en: 'Title', ko: '제목' },
  'sm.colAlbum': { de: 'Album', en: 'Album', ko: '앨범' },
  'sm.min': { de: 'Min.', en: 'min', ko: '분' },
  'sm.hour': { de: 'Std.', en: 'h', ko: '시간' },
  'sm.inPool': { de: '{n} im Pool', en: '{n} in pool', ko: '풀에 {n}곡' },
  'sm.removed': { de: '{n} entfernt', en: '{n} removed', ko: '{n}곡 제외됨' },
  'sm.remove': { de: 'Entfernen', en: 'Remove', ko: '제외' },
  'sm.restore': { de: 'Zurückholen', en: 'Restore', ko: '복구' },
  'sm.removeTitle': { de: 'Aus dem Pool entfernen', en: 'Remove from pool', ko: '풀에서 제외' },
  'sm.restoreTitle': { de: 'Zurück in den Pool holen', en: 'Bring back into the pool', ko: '풀로 복구' },
  'sm.noResults': { de: 'Keine Treffer für „{q}“.', en: 'No matches for “{q}”.', ko: '“{q}”에 대한 결과 없음.' },
  'sm.emptyPlaylist': {
    de: 'Diese Playlist enthält keine Songs.',
    en: 'This playlist has no songs.',
    ko: '이 플레이리스트에는 노래가 없습니다.',
  },

  // ── Ergebnis ──
  'result.kicker': { de: 'Dein Song 🎤', en: 'Your song 🎤', ko: '당신의 노래 🎤' },
  'result.open': { de: 'Auf Spotify öffnen', en: 'Open in Spotify', ko: 'Spotify에서 열기' },
  'result.again': { de: 'Spin', en: 'Spin', ko: 'Spin' },
  'result.switch': { de: 'Playlist wechseln', en: 'Change playlist', ko: '플레이리스트 변경' },
  'result.openElsewhere': {
    de: 'Auf anderer Plattform öffnen',
    en: 'Open on another platform',
    ko: '다른 플랫폼에서 열기',
  },

  // ── Roulette ──
  'roulette.surprise': { de: 'Große Überraschung …', en: 'Big surprise …', ko: '깜짝 등장 …' },
  'roulette.which': { de: 'Welcher Song kommt?', en: 'Which song will it be?', ko: '어떤 노래가 나올까요?' },

  // ── Einstellungen ──
  'settings.title': { de: 'Einstellungen', en: 'Settings', ko: '설정' },
  'settings.close': { de: 'Schließen', en: 'Close', ko: '닫기' },
  'settings.language': { de: 'Sprache', en: 'Language', ko: '언어' },
  'settings.sound': { de: 'Sound', en: 'Sound', ko: '소리' },
  'settings.soundHint': {
    de: 'Tick- und Reveal-Geräusche',
    en: 'Tick and reveal sounds',
    ko: '틱 및 공개 효과음',
  },
  'settings.surprise': { de: 'Überraschungs-Modus', en: 'Surprise mode', ko: '깜짝 모드' },
  'settings.surpriseHint': {
    de: 'Cover & Titel im Roulette verstecken – volle Überraschung',
    en: 'Hide cover & title in the roulette – full surprise',
    ko: '룰렛에서 커버와 제목 숨기기 – 완전한 서프라이즈',
  },
  'settings.reset': { de: 'Gezogene Songs zurücksetzen', en: 'Reset drawn songs', ko: '뽑은 노래 초기화' },
  'settings.resetHint': {
    de: '{n} bereits gezogen – wieder in den Pool holen',
    en: '{n} already drawn – bring back into the pool',
    ko: '{n}곡 이미 뽑음 – 풀로 되돌리기',
  },
  'settings.resetHintNone': {
    de: 'Aktuell sind keine Songs als gezogen markiert',
    en: 'No songs are currently marked as drawn',
    ko: '현재 뽑힌 것으로 표시된 노래가 없습니다',
  },
  'settings.manage': { de: 'Songs verwalten', en: 'Manage songs', ko: '노래 관리' },
  'settings.manageHint': { de: 'Songs aus dem Pool entfernen', en: 'Remove songs from the pool', ko: '풀에서 노래 제외' },
  'settings.manageHintCount': {
    de: 'Songs aus dem Pool entfernen ({n} entfernt)',
    en: 'Remove songs from the pool ({n} removed)',
    ko: '풀에서 노래 제외 ({n}곡 제외됨)',
  },
  'settings.disconnect': { de: 'Spotify trennen', en: 'Disconnect Spotify', ko: 'Spotify 연결 해제' },
  'settings.disconnectHint': {
    de: 'Abmelden und Verbindung lösen',
    en: 'Sign out and disconnect',
    ko: '로그아웃 및 연결 해제',
  },
  'settings.exportGuest': {
    de: 'Gast-Playlist exportieren',
    en: 'Export guest playlist',
    ko: '게스트 플레이리스트 내보내기',
  },
  'settings.exportGuestHint': {
    de: 'JSON für den Login-freien Gast-Modus herunterladen (nach public/ legen)',
    en: 'Download JSON for the login-free guest mode (place in public/)',
    ko: '로그인 없는 게스트 모드용 JSON 다운로드 (public/에 넣기)',
  },
  'settings.exitGuest': { de: 'Gast-Modus beenden', en: 'Exit guest mode', ko: '게스트 모드 종료' },
  'settings.exitGuestHint': {
    de: 'Zurück zur Startseite',
    en: 'Back to the homepage',
    ko: '홈으로 돌아가기',
  },

  // ── App: Spinner & Fehler ──
  'app.checking': { de: 'Verbindung wird geprüft…', en: 'Checking connection…', ko: '연결 확인 중…' },
  'app.loadingSongs': { de: 'Songs werden geladen…', en: 'Loading songs…', ko: '노래 불러오는 중…' },
  'error.noSongs': {
    de: 'Es sind keine Songs geladen. Bitte eine Playlist mit Songs wählen.',
    en: 'No songs loaded. Please choose a playlist with songs.',
    ko: '불러온 노래가 없습니다. 노래가 있는 플레이리스트를 선택하세요.',
  },
  'error.allExcluded': {
    de: 'Alle Songs wurden aus dem Pool entfernt. Hole unter „Songs verwalten“ welche zurück.',
    en: 'All songs were removed from the pool. Bring some back under “Manage songs”.',
    ko: '모든 노래가 풀에서 제외되었습니다. “노래 관리”에서 일부를 복구하세요.',
  },
  'error.pickFailed': {
    de: 'Song konnte nicht ausgewählt werden. Bitte erneut versuchen.',
    en: 'Could not pick a song. Please try again.',
    ko: '노래를 뽑지 못했습니다. 다시 시도하세요.',
  },
  'error.emptyPlaylist': {
    de: 'Diese Playlist enthält keine abspielbaren Songs. Bitte eine andere wählen.',
    en: 'This playlist has no playable songs. Please choose another.',
    ko: '이 플레이리스트에는 재생 가능한 노래가 없습니다. 다른 것을 선택하세요.',
  },
  'error.emptyArtist': {
    de: 'Für diese Artists wurden keine Songs gefunden. Prüfe die Schreibweise.',
    en: 'No songs found for these artists. Check the spelling.',
    ko: '해당 아티스트의 노래를 찾지 못했습니다. 철자를 확인하세요.',
  },
  'error.emptyAlbum': {
    de: 'Für diese Alben wurden keine Songs gefunden. Prüfe die Schreibweise.',
    en: 'No songs found for these albums. Check the spelling.',
    ko: '해당 앨범의 노래를 찾지 못했습니다. 철자를 확인하세요.',
  },
  'error.emptyGenre': {
    de: 'Keine Songs für dieses Genre gefunden. Versuch ein anderes Genre.',
    en: 'No songs found for this genre. Try another genre.',
    ko: '이 장르의 노래를 찾지 못했습니다. 다른 장르를 시도하세요.',
  },
}
