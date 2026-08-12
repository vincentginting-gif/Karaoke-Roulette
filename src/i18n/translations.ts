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
    de: 'Auf „Song auswählen“ tippen – das Roulette dreht und bleibt auf einem zufälligen Song stehen.',
    en: 'Tap “Pick a song” – the roulette spins and lands on a random song.',
    ko: '“노래 뽑기”를 누르면 룰렛이 돌아 무작위 노래에서 멈춥니다.',
  },
  'welcome.step3': {
    de: 'Den Song auf Spotify oder einer anderen Plattform öffnen und lossingen.',
    en: 'Open the song on Spotify or another platform and start singing.',
    ko: 'Spotify나 다른 플랫폼에서 노래를 열고 노래를 시작하세요.',
  },
  'welcome.start': { de: 'Playlist wählen', en: 'Choose playlist', ko: '플레이리스트 선택' },

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
  'home.spin': { de: 'Song auswählen', en: 'Pick a song', ko: '노래 뽑기' },
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
