# Malayalam Film Songs — The Complete Playlist

A static, GitHub-Pages-friendly index of Malayalam film songs, built from the
owner's bilingual catalogue export.
Every song, film and credit carries both its English and Malayalam name, and
both scripts are searchable.

The page is a single HTML file plus `assets/` and `data/`. There is no build
step at runtime and no server: the browser fetches three packed data files once,
decodes them in memory, builds its indexes, and everything after that is
instant.

Data snapshot (generated 2026-11-15): **30,390 songs**, **9,319 films**
(9,258 listed + 61 stubs), **5,638 singers**, **2,049 music directors**,
**2,994 lyricists** and **2,866 directors** with songs, all with English and
Malayalam names.

## Browse

| Category | URL |
| --- | --- |
| Home | `#/` |
| All songs | `#/songs` |
| Years | `#/years` → `#/year/1993` |
| Movies | `#/movies` → `#/movie/1204` |
| Singers | `#/singers` → `#/singer/KJ%20Yesudas` |
| Music directors | `#/music` → `#/music/Johnson` |
| Lyricists | `#/lyricists` → `#/lyricist/Vayalar%20Ramavarma` |
| Directors | `#/directors` → `#/director/Bharathan` |
| Song detail | `#/song/2104` |

The All songs view lists every entry A→Z — weak matches and songs with no
matched video included — and its badge shows the video match grade
(**High / Medium / Low / Manual / No match**) next to the film and year.
The grade pills above the list act as a filter (pick any number of them; no
pills selected shows everything), and they compose with the text filter.
**Both the badges and the grade filter are admin-only** — visitors see the
plain rows without any match-grade decoration.

The search box searches songs and names at the same time: titles, films,
singers, lyricists, music directors and directors, in **English or Malayalam**
(`Yesudas` and `യേശുദാസ്` both work). Press `/` anywhere to focus it.

Hash routing is used on purpose: every URL works when the site is hosted under a
sub-path (for example `https://thecompleteplaylist.github.io/main/songs/`)
without any server-side rewrite rules.

## Deploy to GitHub Pages

1. Copy **the contents of this folder** (`index.html`, `assets/`, `data/`,
   `robots.txt`) into the folder in your repository that should serve the site —
   for example `songs/`. The `comments/` folder is setup documentation and the
   reader script source; it is not needed at runtime, but it is harmless to
   publish.
2. Commit and push. The site will be at
   `https://<user>.github.io/<repo>/songs/`.
3. All URLs are relative, so it also works at the repository root. `.nojekyll`
   is included so that files starting with `_` are served.

Do **not** copy `songdb-work/` anywhere public: it holds the readable JSON
sources and the scrape cache. The site only needs the encrypted files in
`data/`.

`data/songs.dat` is about 1.5 MB, `data/movies.dat` about 0.6 MB and
`data/videos.dat` about 0.15 MB on the wire. They are compressed and encrypted,
not JSON, so they do not grow again in transfer.

## Files

```
index.html          app shell
assets/style.css    styling (dark theme, bilingual typography)
assets/app.js       data loading, indexes, hash router, all views, admin editor
assets/comments-config.js  form / sheet comment settings (see below)
data/songs.dat      every song (compressed + AES encrypted)
data/movies.dat     every film (title, year, music, lyricist, director)
data/videos.dat     song id → video (only matched songs)
data/overrides.json admin corrections published for everyone (optional)
data/meta.json      counts + generation date
comments/           comment form + sheet setup guide and reader script
robots.txt          keeps crawlers out of data/ and assets/
```

The readable source JSON lives outside the web folder, in
`songdb-work/data-json/`. `songdb-work/pack_data.ps1` turns it into the `.dat`
files the site loads. Never copy those JSON files into `songdb/`.

### Data format

The JSON files below are the build source (in `songdb-work/data-json/`); the
site never serves them. Rows are arrays (no repeated field names) so the packed
files stay small.

`songs.json` (`v: 2`):

```json
{
  "v": 2,
  "fields": ["id","title","titleMl","movieId","year",
             "singers","singersMl","lyricist","lyricistMl","music","musicMl"],
  "rows": [
    ["2104","Athisukhamee Jeevitham","അതിസുഖമീ ജീവിതം","1204",1938,
     "KK Aroor","കെ കെ അരൂർ","Muthukulam Raghavan Pillai","മുതുകുളം രാഘവൻപിള്ള","KK Aroor, Ibrahim","കെ കെ അരൂർ, ഇബ്രാഹിം"]
  ]
}
```

* `id` — song id in the source catalogue
* `movieId` — film id in the source catalogue; `"0"` when the listing has no film
* `title` / `titleMl` — English and Malayalam titles
* `singers` / `lyricist` / `music` — comma-separated English names
* `singersMl` / `lyricistMl` / `musicMl` — the same names in Malayalam, in the
  same order (the app pairs them positionally to show both scripts)

`movies.json` (`v: 2`):

```json
{
  "v": 2,
  "fields": ["id","title","titleMl","year","director","directorMl",
             "music","musicMl","lyricist","lyricistMl"],
  "rows": [
    ["1204","Balan","ബാലൻ",1938,"S Nottani","എസ് നൊട്ടാണി",
     "KK Aroor, Ibrahim","കെ കെ അരൂർ, ഇബ്രാഹിം",
     "Muthukulam Raghavan Pillai","മുതുകുളം രാഘവൻപിള്ള"]
  ]
}
```

The 61 films referenced by songs but missing from the A–Z movie listing are
added as stubs (title and year only, credits blank), so no song ever loses its
film. The 2,245 listed films without any songs are kept too and show a
"No songs listed for this film." message.

## Playback

Songs that have been matched to a video play inside the page. A player
bar docks at the bottom with a small video panel, the song and film titles,
previous/next, play/pause, shuffle, a seek bar, a video show/hide button and a
playlist button. Queues are built from what is on screen:

* **Home** — *Play all songs* queues every song that has a video; *Shuffle all*
  starts the same set in random order.
* **Any list** (year, film, singer, composer, lyricist, director, search
  results) — *Play all* and *Shuffle* use the current filter and sort order.
* **A song page** — *Play* starts the film's songs at that song.
* **Any song row** — a ▶ button appears on hover at the right edge of the row. It plays
  the list you are looking at, starting at that song; songs without a matched video are
  skipped (and a row with no match at all shows a notice instead of playing).

The player panel opens with a new queue and has two tabs:

* **Now playing** (the default) — the full song: both titles, film, year,
  singers, lyricist, music director and director (all linked), plus sections
  for *More from this film*, *More by <singer>*, *Written by <lyricist>*,
  *Music by <composer>*, *More from <year>* and *Directed by <director>*.
  Each section lists up to six other playable songs and a *See all* link to
  the full list; clicking a row starts that section as the queue, at the
  clicked song. Clicking the song title in the player bar opens this tab.
* **Playlist** — the whole queue, the current song highlighted, and the
  position ("Song 4 of 212"). Click any row to jump to that song.

Minimise the panel with the arrow in its header and restore it with the
playlist button in the player bar; if you minimise it, later queues stay
minimised until you restore it again.

Songs without a matched video are skipped. If a video refuses embedding
(error 101/150 from the video host) or is otherwise unplayable, the player remembers it for
the session and moves to the next song.

Matches live in `songdb-work/data-json/videos.json`, separate from the song
data; the site loads the packed `data/videos.dat`:

```json
{
  "v": 1,
  "fields": ["id", "videoId", "dur", "conf"],
  "rows": [["7807", "1uFjv0IW8E4", 257, "high"]]
}
```

`conf` is `high` or `medium` (only those are shipped). `dur` is the video
length in seconds. The file is small (about 40 bytes per matched song) and is
loaded in parallel with the song data.

## Admin and editing

The site owner can correct any song or film without rebuilding the whole
catalogue. Go to `#/admin` (also linked from the footer) and sign in.

* Username: `georamesh`
* Password: set when this feature was added; it is **not stored anywhere** —
  only a salted PBKDF2-SHA-256 hash lives in `assets/app.js`.

After signing in, every song row in the browse lists (All songs, year/film/singer/
music/lyricist/director/ragam lists, search results) carries two small icon
buttons at its right edge: a ▶ that plays the list from that song, and a pencil
✏️ that edits it. Song and film pages keep their own *Edit* buttons, and the
admin page has a search box. Clicking any of them opens the editor as a popup
dialog; *Cancel*, `Esc`, the close button or clicking the dimmed backdrop
closes it, and saving applies the change immediately and closes the dialog. Every field can be changed: both titles, year, singers,
lyricist, music, and the video id (the 11-character code after
`watch?v=`; empty means "no video"). Correcting a film's year updates all of its
songs that do not have their own correction.

**Saving.** *Save* stores the change in this browser (localStorage). It is
applied immediately: the page, indexes and search all show the new values.
Because the site is static, other visitors do not see it yet.

**Publishing.** On the admin page, *Download overrides.json* writes a small
patch file. Put it at `songdb/data/overrides.json` and commit it — the site
loads it at startup for every visitor, then layers any browser-local edits on
top. *Revert this song/film* removes the local patch and reloads the original
row. *Load overrides file…* restores a downloaded patch on another machine.
*Discard local changes* clears the browser copy but keeps the published file.

The password is checked with PBKDF2 (310,000 iterations) against a random salt,
compared in constant time. Five wrong attempts lock sign-in for 30 seconds. The
session lives in `sessionStorage`, so closing the tab signs you out, and the
sign-in expires after eight hours.

To change the password later, run
`songdb-work/make_admin_hash.ps1 -Password '…'` and put the printed `iter`,
`salt` and `hash` values into `AUTH` in `assets/app.js`.

## Comments

Every song and film page carries a comment section. **Write a comment** opens a
dark-themed form on the page with just **Name** and **Comment**; the item type,
id and title are submitted as hidden values. The form posts to the response
endpoint of a form owned by the site owner, which stores the comment in its linked
sheet. The page then reads comments back through a small reader script using
JSONP. There is no server and no embedded third-party iframe; an **Open the
form** link is available for anyone who prefers the provider's own form. (The
form service cannot hide pre-filled questions, so that fallback shows the three
item fields; the on-site form is what hides them.) The section is hidden until the
form and reader URLs are filled in
[`assets/comments-config.js`](assets/comments-config.js).

Step-by-step setup (form questions, all five pre-filled entry ids, deployment
and moderation): [`comments/SETUP.md`](comments/SETUP.md). The reader code to
paste into the spreadsheet is [`comments/appsscript.gs`](comments/appsscript.gs).

Comments are public and moderated in the sheet: deleting a row removes the
comment from the site. The sheet itself stays private — only the reader script,
running as the owner, reads it. Up to the latest 100 comments per item are
shown, newest first. The custom form uses the undocumented `formResponse`
endpoint, so the fallback form link is worth keeping available.

## Protecting the data

This is a static site — the browser must receive the catalogue to display it —
so the measures below raise the cost of copying; none of them can make the data
mathematically unreadable to a determined visitor.

* **No plain JSON is shipped.** `songs.dat`, `movies.dat` and `videos.dat` are
  DEFLATE-compressed, AES-256-CBC encrypted, and carry an HMAC-SHA-256 tag that
  is verified before use. Downloading the files gets you opaque binaries that
  no other site can display. (The key is inside `app.js`, because the browser
  must decrypt; it stops casual copying, not a reverse-engineer.)
* **robots.txt** keeps crawlers out of `data/` and `assets/` and turns away the
  usual archiving tools.
* **No plain downloadable export.** The only machine-readable form served is the
  encrypted bundle; re-using it elsewhere means writing code to decrypt it too.
* **Real access control needs a server.** If the catalogue must never be
  downloadable, put the data behind an authenticated API (for example a
  edge worker that checks a token and rate-limits by IP) and have this
  page fetch from it.

## Finding the videos

`songdb-work/yt_search.ps1` searches for a matching video for every song and caches one JSON
line per song in `songdb-work/yt_cache/`; `songdb-work/yt_merge.ps1` turns the
cache into `songdb-work/data-json/videos.json` and repacks `data/videos.dat`.

```powershell
# one process per shard, safe to stop and restart
powershell -NoProfile -ExecutionPolicy Bypass -File .\songdb-work\yt_search.ps1 -Shard 1 -Shards 6

# merge the cache (high + medium confidence only)
powershell -NoProfile -ExecutionPolicy Bypass -File .\songdb-work\yt_merge.ps1
```

For each song the search runs `"<title> <film>"`, and falls back to the
Malayalam title and film when the first result is weak. The top 20 results are
scored on the title phrase (with transliteration-tolerant matching), film,
singer, composer, duration, channel and view count. Karaoke, cover, remix,
reaction, review, trailer and instrumental clips, videos labelled with another
language, and videos whose title carries a year far from the film's year are
never trusted automatically. Only high/medium matches are published; low and
no-match rows stay in the cache for a later pass. The merge is resumable and can
be run while the search is still going.

## Rebuilding the data

The source site changes slowly, but the data can be refreshed:

```powershell
# 1. download the A–Z listing pages (Malayalam + English), resumable
powershell -NoProfile -ExecutionPolicy Bypass -File .\songdb-work\msi_scrape.ps1

# 2. merge the per-letter caches and write songdb-work/data-json/*.json
powershell -NoProfile -ExecutionPolicy Bypass -File .\songdb-work\finalize_msi.ps1

# 3. compress + encrypt them into the files the site loads
powershell -NoProfile -ExecutionPolicy Bypass -File .\songdb-work\pack_data.ps1
```

`msi_scrape.ps1` walks `songs.php` and `movies.php` for letters A–Z at 25 rows
per page, in both the Malayalam and English listings, and joins the two by source id.
It caches each letter in
`songdb-work/msi_cache/`, so an interrupted run resumes where it stopped.
Useful switches: `-Letters ABC` (subset), `-OnlySongs`, `-OnlyMovies`,
`-MaxPages N` (quick test), `-DelayMs 400`, `-Force` (ignore the cache).

`msi_build.ps1` (called by `finalize_msi.ps1`) cleans names, drops source-listing
placeholder values (`Uncategorized`, `Uncatagorized`, `Not Available`,
`No Songs`, `Na`, `Various`, `-`, em/en dashes, and their Malayalam
equivalents such as `ഗാനങ്ങൾ ഇല്ല`), creates film stubs for song references,
and writes the compact `v2` JSON plus `meta.json` — always UTF-8 without a BOM.

The scraper also removes the censor badge (`U` / `A`) that the source listings append to film
titles inside the listing, so *A Life Diary* is stored without a trailing `U`.

The import is a one-time job: roughly 1,200 song-list pages and 370 film-list
pages, fetched politely with a delay. Nothing is scraped on every visit.

## Notes

* The source statistics page counts 9,343 films / 30,398 songs. The alphabetical
  listings expose 9,258 films / 30,390 songs; adding the 61 films that songs
  reference but the listing omits gives 9,319 films. The remaining
  24 films and 8 songs are not reachable from the A–Z (letter-only) listings.
* Song pages have an in-page *Play* button when a video has been matched, plus
  a link to a video search. No audio, video or lyrics files are hosted here —
  playback embeds the matched video through the official embedded player.
* Songs with no known year are grouped under **Unknown year** (`#/year/0`).
* Malayalam text uses the system's Malayalam font (Nirmala UI on Windows,
  Noto Sans Malayalam on Linux/Android, Malayalam Sangam MN on macOS); no web
  font is downloaded.
