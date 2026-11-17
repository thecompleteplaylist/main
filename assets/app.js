/* Malayalam Film Songs — The Complete Playlist
 * Static site: reads the packed data files (songs.dat, movies.dat, videos.dat)
 * built from the bilingual MalayalaSangeetham.info (MSI) listings.
 */
(function () {
  "use strict";

  var DATA_URL = "data/songs.dat";
  var MOVIES_URL = "data/movies.dat";
  var VIDEO_URL = "data/videos.dat";
  var PEOPLE_URL = "data/people.dat";
  var SOURCE = "https://msidb.org/";

  var peopleImages = {};

  var el = function (id) { return document.getElementById(id); };
  var view = el("view");
  var collator = new Intl.Collator("en", { sensitivity: "base", numeric: true });
  var cmp = function (a, b) { return collator.compare(a || "", b || ""); };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function splitNames(s) {
    return String(s || "").split(",").map(function (x) { return x.trim(); }).filter(Boolean);
  }
  function num(n) { return Number(n).toLocaleString("en-IN"); }
  function plural(n, one, many) { return n === 1 ? one : (many || one + "s"); }
  function hashFor(parts) { return "#/" + parts.map(encodeURIComponent).join("/"); }

  /* Pair English and Malayalam credit strings positionally.
     e.g. "KJ Yesudas,KS Chithra" + "കെ ജെ യേശുദാസ്,കെ എസ് ചിത്ര" -> two person objects. */
  function parsePeople(enStr, mlStr) {
    var en = splitNames(enStr), ml = splitNames(mlStr);
    var n = Math.max(en.length, ml.length), out = [], seen = Object.create(null);
    for (var i = 0; i < n; i++) {
      var e = en[i] || "", m = ml[i] || "";
      var key = (e || m).toLowerCase();
      if (!key || seen[key]) continue;
      seen[key] = 1;
      out.push({ en: e, ml: m, key: key });
    }
    return out;
  }

  function namesOf(people) {
    return people.map(function (p) { return p.en || p.ml; }).join(", ");
  }

  var RAGA_EN = {
    "മോഹനം": "Mohanam",
    "സിന്ധുഭൈരവി": "Sindhu Bhairavi",
    "കല്യാണി": "Kalyani",
    "മധ്യമാവതി": "Madhyamavati",
    "കാപി": "Kapi",
    "ആഭേരി": "Abheri",
    "ദർബാരികാനഡ": "Darbari Kanada",
    "ശുദ്ധധന്യാസി": "Shuddha Dhanyasi",
    "ശിവരഞ്ജിനി": "Shivaranjani",
    "ഹിന്ദോളം": "Hindolam",
    "ആനന്ദഭൈരവി": "Ananda Bhairavi",
    "ശങ്കരാഭരണം": "Shankarabharanam",
    "യമുനകല്യാണി": "Yamuna Kalyani",
    "ഖരഹരപ്രിയ": "Kharaharapriya",
    "വൃന്ദാവനസാരംഗ": "Vrindavani Sarang",
    "ഹംസധ്വനി": "Hamsadhwani",
    "ചക്രവാകം": "Chakravakam",
    "ചാരുകേശി": "Charukesi",
    "ഹരികാംബോജി": "Harikambhoji",
    "ജോഗ്": "Jog",
    "ഷണ്മുഖപ്രിയ": "Shanmukhapriya",
    "കീരവാണി": "Karaharapriya",
    "പഹാഡി": "Pahadi",
    "ആരഭി": "Arabhi",
    "മായാമാളവഗൗള": "Mayamalavagowla",
    "ശുദ്ധസാവേരി": "Shuddha Saveri",
    "ദേശ്": "Desh",
    "പന്തുവരാളി": "Pantuvaraali",
    "ശുഭപന്തുവരാളി": "Shubha Pantuvaraali",
    "പീലു": "Peelu",
    "കാംബോജി": "Kambhoji",
    "ശ്രീ": "Sri",
    "ബാഗേശ്രി": "Bageshri",
    "കാനഡ": "Kanada",
    "ശാമ": "Saam",
    "ഗൗരിമനോഹരി": "Gouri Manohari",
    "വലചി": "Valachi",
    "നഠഭൈരവി": "Nadabhairavi",
    "ബേഗഡ": "Begada",
    "ബിഹാഗ്": "Bihag",
    "ബിലഹരി": "Bilahari",
    "നാട്ടക്കുറിഞ്ഞി": "Nattakurinji",
    "വകുളാഭരണം": "Vakulabharanam",
    "മലയമാരുതം": "Malayamarutam",
    "ആഭോഗി": "Abhogi",
    "നീലാംബരി": "Neelambari",
    "ധർമ്മവതി": "Dharmavati",
    "രീതിഗൗള": "Reetigowla",
    "വസന്ത": "Basant",
    "ശ്രീരഞ്ജിനി": "Sriranjani",
    "അമൃതവർഷിണി": "Amritavarshini",
    "മാണ്ട്": "Mant",
    "ഹംസാനന്ദി": "Hamsanandi",
    "നാട്ട": "Natt",
    "രേവതി": "Revathi",
    "കല്യാണവസന്തം": "Kalyana Vasantham",
    "തിലംഗ്": "Tilang",
    "ശഹാന": "Shahana",
    "ഹംസനാദം": "Hamsanadam",
    "ഹമീർകല്യാണി": "Hameer Kalyani",
    "സാരംഗ": "Sarang",
    "സരസാംഗി": "Sarasangi",
    "പുന്നാഗവരാളി": "Punnagavarali",
    "സരസ്വതി": "Saraswati",
    "കമാസ്": "Kamas",
    "ദേവഗാന്ധാരി": "Devagandhari",
    "യദുകുലകാംബോജി": "Yadukula Kambhoji",
    "ബൗളി": "Bowli",
    "സാരമതി": "Saramati",
    "ഭീംപ്ലാസി": "Bheemplasi",
    "ചെഞ്ചുരുട്ടി": "Chenchurutti",
    "സിംഹേന്ദ്രമധ്യമം": "Simhendramadhyamam",
    "മുഖാരി": "Mukhari",
    "തോടി": "Todi",
    "അഠാണ": "Athana",
    "രഞ്ജിനി": "Ranjani",
    "ദ്വിജാവന്തി": "Dwijavanthi",
    "ചന്ദ്രകോണ്‍സ്": "Chandrakauns",
    "സുരുട്ടി": "Surutti",
    "രേവഗുപ്തി": "Revagupti",
    "വാസന്തി": "Vasanthi",
    "ഹേമവതി": "Hemavati",
    "സുമനേശരഞ്ജിനി": "Sumanesha Ranjani",
    "കേദാർ-ഹിന്ദുസ്ഥാനി": "Kedar Hindustani",
    "ആഹരി": "Ahari",
    "ഭൈരവി": "Bhairavi",
    "ജോൺപുരി": "Jonpuri",
    "മിയാൻ‌മൽഹർ": "Miyan Malhar",
    "മിശ്രശിവരഞ്ജിനി": "Mishra Shivaranjani",
    "ശുദ്ധസാരംഗ്": "Shuddha Sarang",
    "പുഷ്പലതിക": "Pushpalatika",
    "ധന്യാസി": "Dhanyasi",
    "സാമന്തമലഹരി": "Samanta Malahari",
    "പൂര്‍വികല്യാണി": "Purvi Kalyani",
    "നവരസകന്നട": "Navarasakannada",
    "ബഹുധാരി": "Bahudari",
    "ഗംഭീരനാട്ട": "Gambhiranata",
    "കുറിഞ്ഞി": "Kurinji",
    "സാവിത്രി": "Savitri",
    "കേദാരഗൗള": "Kedaragowla",
    "ജയന്തശ്രീ": "Jayanthashree",
    "വിജയനാഗരി": "Vijayanagari",
    "ചലനാട്ട": "Chalanatta",
    "ഭൂപാളം": "Bhoopalam",
    "ജനസമ്മോദിനി": "Janasammodini",
    "രസികരഞ്ജിനി": "Rasika Ranjani",
    "കേദാരം": "Kedaram",
    "കുന്തളവരാളി": "Kunthalavarali",
    "കർണ്ണാടകശുദ്ധസാവേരി": "Karnataka Shuddha Saveri",
    "കനകാംഗി": "Kanakangi",
    "സല്ലാപം": "Sallapam",
    "വനസ്പതി": "Vanaspati",
    "ഭാട്ടിയാര്": "Bhatiyar",
    "കർണരഞ്ജിനി": "Karnaranjani",
    "സൗരാഷ്ട്രം": "Saurashtram",
    "ബിന്ദുമാലിനി": "Bindumalini",
    "നർത്തകി": "Narthaki",
    "മേഘമല്ഹാര്": "Megh Malhar",
    "രതിപതിപ്രിയ": "Ratipatipriya",
    "ആന്ദോളിക": "Andolika",
    "ദർബാർ": "Darbar",
    "നാഥനാമക്രിയ": "Nathanamakriya",
    "സാവേരി": "Saveri",
    "ലവംഗി": "Lavangi",
    "സാളഗഭൈരവി": "Salagabhairavi",
    "രുഗ്മാംബരി": "Rugmambari",
    "കദനകുതൂഹലം": "Kadana Kuthuhalam",
    "വിജയശ്രീ": "Vijayashree",
    "മുൾതാനി": "Multani",
    "ഹുസേനി": "Huseni",
    "പൂർണ്ണചന്ദ്രിക": "Poornachandrika",
    "ജപനീയ": "Japaneeya",
    "ശ്യാംകല്യാൺ": "Shyam Kalyan",
    "സൂര്യകോൺസ്": "Suryakauns",
    "ഗുർജരിതോടി": "Gurjari Todi",
    "നാഗനന്ദിനി": "Naganandini",
    "രവിചന്ദ്രിക": "Ravichandrika",
    "ലളിത": "Lalith",
    "വീണാധരി": "Veenadhari",
    "വിഭാവരി": "Vibhavari",
    "രസികപ്രിയ": "Rasikapriya",
    "മലഹരി": "Malahari",
    "ജഗന്മോഹിനി": "Jagamohini",
    "മാനവതി": "Manavati",
    "ഖമാജ്-ഹിന്ദുസ്ഥാനി": "Khamaj Hindustani",
    "ജ്യോതിസ്വരൂപിണി": "Jyotiswaroopini",
    "ചിത്രാംബരി": "Chitrambari",
    "ബഹുമാരിണി": "Bahumalini",
    "നിരോഷ്ഠ": "Niroshta",
    "ഐരാവതി": "Airavathi",
    "ഗോരഖ്കല്യാൺ": "Gorakh Kalyan",
    "മേഘ്": "Megh",
    "രഘുപ്രിയ": "Raghupriya",
    "തിലക്-കാമോദ്": "Tilak Kamod",
    "ജലധർകേദാർ": "Jaladhara Kedar",
    "ധനാശ്രീ": "Dhanashree",
    "ബസന്ത്ബഹാർ": "Basant Bahar",
    "കലാവതി": "Kalavati",
    "ദേശാക്ഷി": "Desakshi",
    "രോഹിണി": "Rohini",
    "ലതാംഗി": "Latangi",
    "സരസ്വതിമനോഹരി": "Saraswati Manohari",
    "ഗോപികാതിലകം": "Gopikathilakam",
    "മാൽഗുഞ്ചി": "Malgunji",
    "ആനന്ദാംബരി": "Anandambari",
    "ജനരഞ്ജിനി": "Janaranjani",
    "ഗൗള": "Gowla",
    "ദേവമനോഹരി": "Devamanohari",
    "രാഗവർദ്ധിനി": "Ragavardhini",
    "നാഗഗാന്ധാരി": "Naga Gandhari",
    "വാചസ്പതി": "Vachaspati",
    "വസന്തഭൈരവി": "Vasantha Bhairavi",
    "താണ്ഡവപ്രിയ": "Tandavapriya",
    "മനോലയം": "Manolyam",
    "പൊന്നി": "Ponni",
    "ഋഷഭപ്രിയ": "Rishabapriya",
    "ധേനുക": "Dhenuka",
    "ഓംകാരഘോഷിണി": "Omkaraghoshini",
    "മല്ലികാവസന്തം": "Mallika Vasantham"
  };

  var RAGA_NORM = null;
  function ragamCanon(k) {
    return String(k || "")
      .normalize("NFC")
      .replace(/[\u200B\u200C\u200D\uFEFF]/g, "")
      .replace(/\s+/g, "");
  }
  function buildRagaNorm() {
    RAGA_NORM = {};
    for (var k in RAGA_EN) {
      if (Object.prototype.hasOwnProperty.call(RAGA_EN, k)) {
        RAGA_NORM[ragamCanon(k)] = RAGA_EN[k];
      }
    }
  }
  function ragaEn(ragaKey) {
    if (!RAGA_NORM) buildRagaNorm();
    return RAGA_NORM[ragamCanon(ragaKey)] || "";
  }
  /* canonical index key: zero-width / whitespace stripped */
  function ragamKey(ragaKey) {
    return ragamCanon(ragaKey);
  }

  var state = {
    ready: false,
    songs: [],
    videos: new Map(),
    byId: new Map(),
    movies: new Map(),
    indexes: null,
    people: new Map(),
    ragams: new Map(),
    searchTimer: null,
    overrides: { songs: {}, movies: {} },
    adminTarget: null
  };

  /* ---------------- data loading ---------------- */
  function fetchJSON(url, onProgress) {
    return fetch(url, { cache: "no-cache" }).then(function (res) {
      if (!res.ok) throw new Error(url + " -> HTTP " + res.status);
      var total = parseInt(res.headers.get("content-length") || "0", 10);
      if (!res.body || !onProgress || !total || !res.body.getReader) return res.json();
      var reader = res.body.getReader();
      var chunks = [], received = 0;
      return (function pump() {
        return reader.read().then(function (r) {
          if (r.done) {
            var buf = new Uint8Array(received), off = 0;
            chunks.forEach(function (c) { buf.set(c, off); off += c.length; });
            return JSON.parse(new TextDecoder("utf-8").decode(buf));
          }
          chunks.push(r.value);
          received += r.value.length;
          onProgress(Math.min(0.99, received / total));
          return pump();
        });
      })();
    });
  }

  /* ---------------- packed data (DEFLATE + AES-256-CBC + HMAC) ----------------
     Files are binary, so the raw JSON and the site's data are not fetchable as
     text. The key has to live in the browser to render the page at all; this
     raises the bar for casual copying, it is not a secret. */
  var DATA_KEY = "Cpv3mLrRY02A2INDG/ZrESu" + "SFqEfzwiRlr39w+fXJy0=";
  var keyCache = null;
  var utf8Dec = new TextDecoder("utf-8");

  function b64Bytes(s) {
    var bin = atob(s), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  function dataKeys() {
    if (keyCache) return keyCache;
    if (!window.crypto || !window.crypto.subtle) {
      return Promise.reject(new Error("This browser cannot decode the data (Web Crypto unavailable)."));
    }
    var raw = b64Bytes(DATA_KEY);
    var macInput = new Uint8Array(raw.length + 3);
    macInput.set(raw, 0);
    macInput.set([109, 97, 99], raw.length); // "mac"
    keyCache = Promise.all([
      crypto.subtle.importKey("raw", raw, { name: "AES-CBC" }, false, ["decrypt"]),
      crypto.subtle.digest("SHA-256", macInput).then(function (h) {
        return crypto.subtle.importKey("raw", h, { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
      })
    ]).then(function (keys) { return { aes: keys[0], hmac: keys[1] }; });
    return keyCache;
  }

  function inflateBytes(bytes) {
    if (!window.DecompressionStream) {
      return Promise.reject(new Error("This browser cannot unpack the data (DecompressionStream unavailable)."));
    }
    var stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
    return new Response(stream).text();
  }

  function unpack(buf) {
    var u8 = new Uint8Array(buf);
    if (u8.length < 52 || utf8Dec.decode(u8.subarray(0, 4)) !== "MSP1") {
      return Promise.reject(new Error("data file is not in the expected format"));
    }
    var iv = u8.subarray(4, 20);
    var tag = u8.subarray(u8.length - 32);
    var body = u8.subarray(0, u8.length - 32);
    var cipher = u8.subarray(20, u8.length - 32);
    return dataKeys().then(function (keys) {
      return crypto.subtle.verify("HMAC", keys.hmac, tag, body).then(function (ok) {
        if (!ok) throw new Error("data file failed its integrity check");
        return crypto.subtle.decrypt({ name: "AES-CBC", iv: iv }, keys.aes, cipher);
      });
    }).then(inflateBytes).then(function (text) {
      return JSON.parse(text);
    });
  }

  function fetchBytes(url, onProgress) {
    return fetch(url, { cache: "no-cache" }).then(function (res) {
      if (!res.ok) throw new Error(url + " -> HTTP " + res.status);
      var total = parseInt(res.headers.get("content-length") || "0", 10);
      if (!res.body || !onProgress || !total || !res.body.getReader) return res.arrayBuffer();
      var reader = res.body.getReader();
      var chunks = [], received = 0;
      return (function pump() {
        return reader.read().then(function (r) {
          if (r.done) {
            var buf = new Uint8Array(received), off = 0;
            chunks.forEach(function (c) { buf.set(c, off); off += c.length; });
            return buf.buffer;
          }
          chunks.push(r.value);
          received += r.value.length;
          onProgress(Math.min(0.99, received / total));
          return pump();
        });
      })();
    });
  }

  function fetchPacked(url, onProgress) {
    return fetchBytes(url, onProgress).then(unpack);
  }

  function fieldIndex(data) {
    var map = {};
    (data.fields || []).forEach(function (name, i) { map[name] = i; });
    return map;
  }

  /* ---------------- editable overrides (admin) ---------------- */
  var OVR_KEY = "msi.overrides.v1";

  function emptyOverrides() { return { songs: {}, movies: {} }; }

  function copyKind(from, to) {
    if (!from || typeof from !== "object") return;
    Object.keys(from).forEach(function (id) {
      if (from[id] && typeof from[id] === "object") to[id] = from[id];
    });
  }

  function loadOverrides() {
    return fetchJSON("data/overrides.json").catch(function () { return null; }).then(function (published) {
      var ov = emptyOverrides();
      if (published) { copyKind(published.songs, ov.songs); copyKind(published.movies, ov.movies); }
      try {
        var local = JSON.parse(localStorage.getItem(OVR_KEY) || "null");
        if (local) { copyKind(local.songs, ov.songs); copyKind(local.movies, ov.movies); }
      } catch (e) { /* ignore a broken local store */ }
      state.overrides = ov;
    });
  }

  function saveOverrides() {
    try { localStorage.setItem(OVR_KEY, JSON.stringify(state.overrides)); }
    catch (e) { toast("Could not save locally — storage is full or blocked."); }
  }

  function peoplePair(o, enKey, mlKey, current) {
    var en = o[enKey] != null ? o[enKey] : namesOf(current);
    var ml = o[mlKey] != null ? o[mlKey] : current.map(function (p) { return p.ml; }).join(", ");
    return parsePeople(en, ml);
  }

  function applyOverrides() {
    var ov = state.overrides;

    Object.keys(ov.movies).forEach(function (id) {
      var m = state.movies.get(String(id));
      var o = ov.movies[id];
      if (!m || !o) return;
      if (o.title != null) m.title = String(o.title);
      if (o.titleMl != null) m.titleMl = String(o.titleMl);
      if (o.year != null) m.year = parseInt(o.year, 10) || 0;
      if (o.director != null || o.directorMl != null) m.director = peoplePair(o, "director", "directorMl", m.director);
      if (o.music != null || o.musicMl != null) m.music = peoplePair(o, "music", "musicMl", m.music);
      if (o.lyricist != null || o.lyricistMl != null) m.lyricist = peoplePair(o, "lyricist", "lyricistMl", m.lyricist);
    });

    state.songs.forEach(function (s) {
      var o = ov.songs[s.id];
      if (o) {
        if (o.title != null) s.title = String(o.title);
        if (o.titleMl != null) s.titleMl = String(o.titleMl);
        if (o.year != null) s.year = parseInt(o.year, 10) || 0;
        if (o.singers != null || o.singersMl != null) s.singers = peoplePair(o, "singers", "singersMl", s.singers);
        if (o.lyricist != null || o.lyricistMl != null) s.lyricist = peoplePair(o, "lyricist", "lyricistMl", s.lyricist);
        if (o.music != null || o.musicMl != null) s.music = peoplePair(o, "music", "musicMl", s.music);
        if (o.videoId != null) {
          if (o.videoId) state.videos.set(s.id, { id: String(o.videoId), dur: 0, conf: "manual" });
          else state.videos.delete(s.id);
        }
      }
      // a corrected film year applies to every song in it
      if (s.movie) {
        var mo = ov.movies[s.movie.id];
        if (mo && mo.year != null && (!o || o.year == null)) s.year = parseInt(mo.year, 10) || 0;
      }
    });
  }

  function loadData() {
    var status = el("bootStatus"), bar = el("bootBar");
    var prog = { s: 0, m: 0, v: 0 };
    function report() {
      var p = prog.s * 0.72 + prog.m * 0.18 + prog.v * 0.10;
      if (bar) bar.style.width = Math.round(p * 100) + "%";
      if (status) {
        status.textContent = prog.s < 1
          ? "Downloading song data… " + Math.round(p * 100) + "%"
          : prog.m < 1
            ? "Downloading movie data… " + Math.round(p * 100) + "%"
            : "Loading video links… " + Math.round(p * 100) + "%";
      }
    }
    return Promise.all([
      fetchPacked(DATA_URL, function (p) { prog.s = p; report(); }),
      fetchPacked(MOVIES_URL, function (p) { prog.m = p; report(); }),
      fetchPacked(VIDEO_URL, function (p) { prog.v = p; report(); }).catch(function () { prog.v = 1; report(); return null; }),
      fetchPacked(PEOPLE_URL).catch(function () { return null; }),
      loadOverrides()
    ]).then(function (res) {
      var movieData = res[1], movieF = fieldIndex(movieData);
      (movieData.rows || []).forEach(function (r) {
        var m = {
          id: String(r[movieF.id]),
          title: r[movieF.title] || "",
          titleMl: r[movieF.titleMl] || "",
          year: r[movieF.year] || 0,
          director: parsePeople(r[movieF.director], r[movieF.directorMl]),
          music: parsePeople(r[movieF.music], r[movieF.musicMl]),
          lyricist: parsePeople(r[movieF.lyricist], r[movieF.lyricistMl]),
          songIds: [],
          hay: "",
          poster: r[movieF.poster] || ""
        };
        state.movies.set(m.id, m);
      });

      var songData = res[0], sf = fieldIndex(songData);
      state.songs = (songData.rows || []).map(function (r, i) {
        return {
          i: i,
          id: String(r[sf.id]),
          title: r[sf.title] || "",
          titleMl: r[sf.titleMl] || "",
          movieId: String(r[sf.movieId] || ""),
          year: r[sf.year] || 0,
          singers: parsePeople(r[sf.singers], r[sf.singersMl]),
          lyricist: parsePeople(r[sf.lyricist], r[sf.lyricistMl]),
          music: parsePeople(r[sf.music], r[sf.musicMl]),
          raga: r[sf.raga] || "",
          director: [],
          movie: null,
          hay: ""
        };
      });
      var videoData = res[2];
      if (videoData && videoData.rows && videoData.rows.length) {
        videoData.rows.forEach(function (r) {
          state.videos.set(String(r[0]), { id: String(r[1]), dur: Number(r[2]) || 0, conf: r[3] || "" });
        });
      }

      // singer images from people.dat — merge into people registry by name key
      var peopleData = res[3];
      if (peopleData && peopleData.rows && peopleData.rows.length) {
        var pf = fieldIndex(peopleData);
        peopleData.rows.forEach(function (r) {
          var key = String(r[pf.name] || "").toLowerCase();
          if (key) { peopleImages[key] = r[pf.sl] || ""; }
        });
      }

      buildIndexes();
      applyOverrides();
      buildIndexes();
      state.ready = true;
      if (status) status.textContent = "Building indexes…";
    });
  }

  function push(map, key, i) {
    if (!key) return;
    var a = map.get(key);
    if (a) a.push(i); else map.set(key, [i]);
  }

  function buildIndexes() {
    var idx = {
      year: new Map(), singer: new Map(), lyricist: new Map(),
      music: new Map(), director: new Map(), raga: new Map(),
      movie: state.movies
    };
    var reg = new Map();
    state.people = reg;
state.ragams = new Map();

    function register(p) {
      var r = reg.get(p.key);
      var sl = peopleImages[p.key] || "";
      if (!r) { r = { en: p.en, ml: p.ml, sl: sl }; reg.set(p.key, r); }
      else {
        if (!r.ml && p.ml) r.ml = p.ml;
        if (!r.en && p.en) r.en = p.en;
        if (!r.sl && sl) r.sl = sl;
      }
      return r;
    }

    state.movies.forEach(function (m) {
      m.songIds = [];
      m.director.forEach(register);
      m.music.forEach(register);
      m.lyricist.forEach(register);
    });

    state.songs.forEach(function (s) {
      s.singers.forEach(register);
      s.lyricist.forEach(register);
      s.music.forEach(register);

      var m = state.movies.get(s.movieId);
      if (!m) {
        m = { id: s.movieId, title: "", titleMl: "", year: s.year, director: [], music: [], lyricist: [], songIds: [], hay: "" };
        state.movies.set(s.movieId, m);
      }
      if (!m.year && s.year) m.year = s.year;
      s.movie = m;
      s.director = m.director;
      m.songIds.push(s.i);

      var hay = [s.title, s.titleMl, m.title, m.titleMl, s.year];
      s.singers.forEach(function (p) { hay.push(p.en, p.ml); });
      s.lyricist.forEach(function (p) { hay.push(p.en, p.ml); });
      s.music.forEach(function (p) { hay.push(p.en, p.ml); });
      (s.raga || "").split(",").forEach(function (k) {
        var ck = ragamKey(k);
        if (ck) { hay.push(ck, ragaEn(ck)); }
      });
      s.hay = hay.join(" ").toLowerCase();

      state.byId.set(s.id, s);
      push(idx.year, String(s.year || 0), s.i);
      s.singers.forEach(function (p) { push(idx.singer, p.key, s.i); });
      s.lyricist.forEach(function (p) { push(idx.lyricist, p.key, s.i); });
      s.music.forEach(function (p) { push(idx.music, p.key, s.i); });
      (s.raga || "").split(",").forEach(function (k) {
        var raw = k.trim();
        var key = ragamKey(raw);
        if (key) push(idx.raga, key, s.i);
      });
    });

    idx.raga.forEach(function (arr, key) {
      state.ragams.set(key, { ml: key, en: ragaEn(key) || "", count: arr.length });
    });

    state.movies.forEach(function (m) {
      if (!m.songIds.length) return;
      m.director.forEach(function (p) {
        m.songIds.forEach(function (i) { push(idx.director, p.key, i); });
      });
    });

    state.movies.forEach(function (m) {
      var mh = [m.title, m.titleMl, m.year];
      m.music.forEach(function (p) { mh.push(p.en, p.ml); });
      m.lyricist.forEach(function (p) { mh.push(p.en, p.ml); });
      m.director.forEach(function (p) { mh.push(p.en, p.ml); });
      m.hay = mh.join(" ").toLowerCase();
    });

    state.indexes = idx;
    el("footStats").textContent =
      num(state.songs.length) + " songs · " + num(state.movies.size) + " movies · " +
      num(idx.singer.size) + " singers";
  }

  /* ---------------- helpers ---------------- */
  function entityEntries(map) {
    var out = [];
    map.forEach(function (arr, key) {
      var p = state.people.get(key) || { en: key, ml: "" };
      out.push({ key: key, name: p.en || p.ml, ml: p.en ? p.ml : "", count: arr.length });
    });
    out.sort(function (a, b) { return cmp(a.name, b.name); });
    return out;
  }

  var ROUTE_KIND = { singer: "singers", music: "music", lyricist: "lyricists", director: "directors" };
  var NAV_FOR = { year: "years", movie: "movies", song: "", singer: "singers", music: "music", lyricist: "lyricists", director: "directors", ragam: "ragams", ragams: "ragams" };

  function letterOf(name) {
    var ch = (name || "").trim().charAt(0).toUpperCase();
    return /[A-Z0-9]/.test(ch) ? ch : "#";
  }

  function songSort(list, mode) {
    var arr = list.slice();
    if (mode === "az") {
      arr.sort(function (a, b) { return cmp(a.title, b.title) || a.year - b.year; });
    } else {
      arr.sort(function (a, b) { return (b.year || 0) - (a.year || 0) || cmp(a.title, b.title); });
    }
    return arr;
  }

  function chunked(container, items, rowFn, groupFn, pageSize) {
    var pos = 0, lastGroup = null;
    pageSize = pageSize || 200;
    var more = document.createElement("button");
    more.className = "loadmore";
    more.type = "button";
    more.textContent = "Show more";
    function render() {
      var frag = document.createDocumentFragment();
      var end = Math.min(items.length, pos + pageSize);
      for (; pos < end; pos++) {
        var it = items[pos];
        if (groupFn) {
          var g = groupFn(it);
          if (g !== lastGroup) {
            lastGroup = g;
            var h = document.createElement("div");
            h.className = "letterhead";
            h.textContent = g;
            frag.appendChild(h);
          }
        }
        frag.appendChild(rowFn(it, pos));
      }
      container.insertBefore(frag, more);
      more.style.display = pos >= items.length ? "none" : "";
      more.textContent = "Show " + Math.min(pageSize, items.length - pos) + " more of " + num(items.length - pos);
    }
    container.appendChild(more);
    more.addEventListener("click", render);
    render();
    return { render: render };
  }

  function layout(html) {
    view.innerHTML = '<div class="page">' + html + "</div>";
    var h = document.querySelector(".pagehead h1");
    document.title = h
      ? h.textContent.replace(/\s+/g, " ").trim() + " · Malayalam Film Songs"
      : "Malayalam Film Songs · The Complete Playlist";
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function crumbs(parts) {
    var s = '<div class="crumbs"><a href="#/">Home</a>';
    parts.forEach(function (p) {
      s += '<span class="sep">/</span>';
      if (p.href) s += '<a href="' + p.href + '">' + esc(p.label) + "</a>";
      else s += "<span>" + esc(p.label) + "</span>";
    });
    return s + "</div>";
  }

  function linkFor(kind, name) {
    return hashFor([kind, name]);
  }

  function mlSpan(text, cls) {
    return text ? '<span lang="ml" class="ml' + (cls ? " " + cls : "") + '">' + esc(text) + "</span>" : "";
  }

  function songRow(s, n) {
    var a = document.createElement("a");
    a.className = "srow";
    a.href = hashFor(["song", s.id]);
    var movie = s.movie ? s.movie.title || s.movie.titleMl : "";
    a.innerHTML =
      '<span class="n">' + n + "</span>" +
      '<span class="t">' +
        '<span class="tt">' + esc(s.title || s.titleMl) + "</span>" +
        (s.title && s.titleMl ? mlSpan(s.titleMl, "tml") : "") +
        '<span class="ts">' + esc(movie || "—") + (s.year ? " · " + s.year : "") + "</span>" +
      "</span>" +
      '<span class="a">' + esc(namesOf(s.singers) || "—") + "</span>" +
      '<span class="m">' + esc(namesOf(s.music) || "—") + "</span>" +
      '<span class="y">' + (s.year || "") + "</span>";
    return a;
  }

  /* ---------------- home ---------------- */
  function renderHome() {
    var idx = state.indexes;
    var movieCount = idx.movie.size;
    var singerCount = idx.singer.size;
    var musicCount = idx.music.size;
    var lyricCount = idx.lyricist.size;
    var dirCount = idx.director.size;
    var ragaCount = idx.raga.size;
    var yearCount = idx.year.size;
    var yearsArr = Array.from(idx.year.keys()).map(Number).filter(Boolean).sort(function (a, b) { return a - b; });
    var span = yearsArr.length ? yearsArr[0] + "–" + yearsArr[yearsArr.length - 1] : "";

    var html =
      '<section class="hero">' +
      '<div class="eyebrow">The Complete Playlist</div>' +
      "<h1>Every Malayalam film song,<br><em>sorted the way you remember them.</em></h1>" +
      "<p>Browse " + num(state.songs.length) + " songs from " + num(movieCount) +
      " films — by year, movie, singer, music director, lyricist, director or ragam. " +
      "English and Malayalam names are searchable. Pick a category to see its list, then open any entry for the songs.</p>" +
      '<div class="bigstats">' +
      "<div><b>" + num(state.songs.length) + "</b>Songs</div>" +
      "<div><b>" + num(movieCount) + "</b>Movies</div>" +
      "<div><b>" + num(singerCount) + "</b>Singers</div>" +
      "<div><b>" + num(musicCount) + "</b>Music directors</div>" +
      "<div><b>" + num(yearCount) + "</b>Years</div>" +
      "<div><b>" + num(ragaCount) + "</b>Ragams</div>" +
      "</div>" +
      '<div class="playall">' +
        (state.videos.size
          ? '<button class="btn primary" id="homePlay">▶ Play all songs</button>' +
            '<button class="btn" id="homeShuffle">🔀 Shuffle all</button>' +
            '<span class="mut">' + num(state.videos.size) + " songs have videos</span>"
          : '<span class="mut">Video links are still being built — check back soon.</span>') +
      "</div></section>" +

      '<section class="sectionhead"><h2>Browse by</h2></section>' +
      '<div class="cats">' +
      cat("#/years", "📅", "Year", "Films grouped by release year" + (span ? ", " + span : "") + ".", num(yearCount) + " years") +
      cat("#/movies", "🎬", "Movies", "Every film in the database, with its director.", num(movieCount) + " movies") +
      cat("#/singers", "🎤", "Singers", "Playback singers, from the legends to the new voices.", num(singerCount) + " singers") +
      cat("#/music", "🎼", "Music directors", "Composers and music directors of Malayalam cinema.", num(musicCount) + " composers") +
      cat("#/lyricists", "✍️", "Lyricists", "Poets and lyricists who wrote the words.", num(lyricCount) + " lyricists") +
      cat("#/directors", "🎥", "Directors", "Film directors, linked to the songs in their films.", num(dirCount) + " directors") +
      cat("#/ragams", "🎶", "Ragams", "Songs grouped by raga, the melodic mode of the performance.", num(ragaCount) + " ragams") +
      "</div>" +

      '<section class="sectionhead"><h2>Recent years</h2><a href="#/years">All years →</a></section>' +
      '<div class="recent">' + recentYears(8) + "</div>";

    layout(html);
    if (state.videos.size) {
      el("homePlay").addEventListener("click", function () { playQueue(allPlayable(), "All songs"); });
      el("homeShuffle").addEventListener("click", function () { shuffleQueue(allPlayable(), "All songs"); });
    }
  }

  function cat(href, ico, title, desc, n) {
    return '<a class="cat" href="' + href + '">' +
      '<div class="ico">' + ico + "</div><h3>" + esc(title) + "</h3>" +
      "<p>" + esc(desc) + '</p><div class="n">' + esc(n) + "</div></a>";
  }

  function recentYears(n) {
    var years = Array.from(state.indexes.year.keys()).map(Number).sort(function (a, b) { return b - a; });
    return years.slice(0, n).map(function (y) {
      return '<a class="ecard" href="' + hashFor(["year", y]) + '">' +
        '<span class="name">' + y + "</span>" +
        '<span class="num">' + num(state.indexes.year.get(String(y)).length) + " songs</span></a>";
    }).join("");
  }

  /* ---------------- years ---------------- */
  function renderYears() {
    var years = Array.from(state.indexes.year.keys()).map(Number).sort(function (a, b) { return b - a; });
    var decades = new Map();
    years.forEach(function (y) {
      var d = y ? Math.floor(y / 10) * 10 : 0;
      if (!decades.has(d)) decades.set(d, []);
      decades.get(d).push(y);
    });
    var html = crumbs([{ label: "Years" }]) +
      '<div class="pagehead"><div class="kicker">Browse</div><h1>Years</h1>' +
      '<div class="sub"><b>' + num(years.length) + '</b> years · <b>' + num(state.songs.length) + "</b> songs</div></div>";

    Array.from(decades.keys()).sort(function (a, b) { return b - a; }).forEach(function (d) {
      var label = d ? d + "s" : "Unknown year";
      html += '<div class="letterhead">' + label + "</div>" + '<div class="elist">';
      decades.get(d).sort(function (a, b) { return b - a; }).forEach(function (y) {
        var count = state.indexes.year.get(String(y)).length;
        html += '<a class="ecard" href="' + hashFor(["year", y]) + '">' +
          '<span class="name">' + (y || "Unknown") + "</span>" +
          '<span class="num">' + num(count) + " songs</span></a>";
      });
      html += "</div>";
    });
    layout(html);
  }

  /* ---------------- entity index pages ---------------- */
  var KINDS = {
    singers: { key: "singer", label: "Singers", singular: "singer", route: "singer" },
    music: { key: "music", label: "Music directors", singular: "music director", route: "music" },
    lyricists: { key: "lyricist", label: "Lyricists", singular: "lyricist", route: "lyricist" },
    directors: { key: "director", label: "Directors", singular: "director", route: "director" }
  };

  function entityNameHtml(e) {
    return '<span class="name">' + esc(e.name) + (e.ml ? mlSpan(e.ml) : "") + "</span>";
  }

  function renderEntityIndex(kindKey) {
    var kind = KINDS[kindKey];
    var entries = entityEntries(state.indexes[kind.key]);
    var html = crumbs([{ label: kind.label }]) +
      '<div class="pagehead"><div class="kicker">Browse</div><h1>' + kind.label + "</h1>" +
      '<div class="sub"><b>' + num(entries.length) + "</b> " + kind.label.toLowerCase() +
      " across <b>" + num(state.songs.length) + "</b> songs</div></div>" +
      '<div class="tools"><input id="filterBox" type="search" placeholder="Filter ' + kind.label.toLowerCase() + '…" autocomplete="off" />' +
      '<span class="mut" id="filterCount"></span></div>' +
      '<div class="letters elist" id="letters"></div>';
    layout(html);
    var box = el("filterBox");
    var letters = el("letters");
    var countEl = el("filterCount");

    function draw() {
      var q = box.value.trim().toLowerCase();
      var list = q ? entries.filter(function (e) {
        return (e.name + " " + e.ml).toLowerCase().indexOf(q) >= 0;
      }) : entries;
      countEl.textContent = q ? num(list.length) + " found" : "";
      letters.innerHTML = "";
      if (!list.length) { letters.innerHTML = '<div class="nores">Nothing matches that filter.</div>'; return; }
      chunked(letters, list, function (it) {
        var a = document.createElement("a");
        a.className = "ecard";
        a.href = hashFor([kind.route, it.name]);
        a.innerHTML = entityNameHtml(it) + '<span class="num">' + num(it.count) + "</span>";
        return a;
      }, function (it) { return letterOf(it.name); }, 240);
    }
    box.addEventListener("input", draw);
    draw();
  }

  /* ---------------- songs of an entity ---------------- */
  function songsView(opts) {
    var ids = opts.ids || [];
    var songs = [];
    if (state.songs && state.songs.length) {
        songs = ids.filter(function (i) { return i >= 0 && i < state.songs.length; }).map(function (i) { return state.songs[i]; });
    }
    var posterHtml = "";
    if (opts.poster) {
      posterHtml = '<div class="entity-poster"><img class="movie-poster" src="' + esc(opts.poster) + '" alt="' + esc(opts.title) + ' poster" /></div>';
    }
    var singerHtml = "";
    if (opts.singerImg) {
      singerHtml = '<div class="entity-poster singer-poster"><img class="singer-image" src="' + esc(opts.singerImg) + '" alt="' + esc(opts.title) + ' singer" /></div>';
    }
    var html = posterHtml + singerHtml +
      crumbs(opts.crumbs) +
      '<div class="pagehead"><div class="kicker">' + esc(opts.kicker || "Songs") + "</div>" +
      "<h1>" + esc(opts.title) + "</h1>" +
      (opts.titleMl ? '<div lang="ml" class="headml">' + esc(opts.titleMl) + "</div>" : "") +
      '<div class="sub"><b>' + num(songs.length) + "</b> " + plural(songs.length, "song") +
      (opts.sub ? " · " + opts.sub : "") + "</div></div>" +
      '<div class="tools"><input id="filterBox" type="search" placeholder="Filter these songs…" autocomplete="off" />' +
      '<div class="seg playseg"><button id="playList">▶ Play all</button><button id="shuffleList">🔀 Shuffle</button></div>' +
      '<div class="seg" id="sortSeg"><button data-sort="year" class="active">Newest first</button><button data-sort="az">A → Z</button></div>' +
      '<span class="mut" id="filterCount"></span></div>' +
      '<div class="slist" id="slist"></div>' +
      (opts.comments ? commentsSection(opts.comments.kind, opts.comments.id, opts.comments.title) : "");
    layout(html);

    var box = el("filterBox"), listEl = el("slist"), countEl = el("filterCount");
    var sortMode = "year", filtered = songs, r = null;

    function apply() {
      var q = box.value.trim().toLowerCase();
      filtered = q ? songs.filter(function (s) {
        return s.hay.indexOf(q) >= 0;
      }) : songs;
      countEl.textContent = q ? num(filtered.length) + " found" : "";
      draw();
    }
    function draw() {
      listEl.innerHTML = "";
      var sorted = songSort(filtered, sortMode);
      if (!sorted.length) {
        listEl.innerHTML = '<div class="nores">' +
          esc(songs.length ? "No songs match that filter." : (opts.emptyText || "No songs listed.")) + "</div>";
        return;
      }
      r = chunked(listEl, sorted, function (s, n) { return songRow(s, n + 1); }, null, 250);
    }
    box.addEventListener("input", apply);
    el("playList").addEventListener("click", function () {
      playQueue(songSort(filtered, sortMode).map(function (s) { return s.i; }), opts.queueLabel || opts.title || "This list");
    });
    el("shuffleList").addEventListener("click", function () {
      shuffleQueue(songSort(filtered, sortMode).map(function (s) { return s.i; }), opts.queueLabel || opts.title || "This list");
    });
    el("sortSeg").addEventListener("click", function (ev) {
      var b = ev.target.closest("button");
      if (!b) return;
      sortMode = b.dataset.sort;
      Array.prototype.forEach.call(el("sortSeg").children, function (x) { x.classList.toggle("active", x === b); });
      draw();
    });
    apply();
    if (opts.comments) {
      wireComments(opts.comments.kind, opts.comments.id, opts.comments.title);
    }
  }

  function renderEntitySongs(kindKey, name) {
    var kind = KINDS[kindKey];
    var key = name.toLowerCase();
    var ids = state.indexes[kind.key].get(key) || [];
    var person = state.people.get(key) || {};
    // Singer image via person.sl
    var singerImg = person.sl || "";
    songsView({
      crumbs: [{ label: kind.label, href: "#/" + kindKey }, { label: name }],
      kicker: kind.singular.charAt(0).toUpperCase() + kind.singular.slice(1),
      title: name,
      titleMl: person.ml || "",
      ids: ids,
      singerImg: singerImg,
      queueLabel: name,
      sub: num(new Set(ids.map(function (i) { return state.songs[i].movieId; })).size) + " " +
        plural(new Set(ids.map(function (i) { return state.songs[i].movieId; })).size, "movie"),
    });
  }

  /* ---------------- ragams ---------------- */
  function ragamEntries() {
    var list = [];
    state.ragams.forEach(function (r, key) {
      list.push({ key: key, en: r.en || r.ml, ml: r.en ? r.ml : "", count: r.count });
    });
    list.sort(function (a, b) { return cmp(a.en, b.en); });
    return list;
  }

  function ragamNameOf(key) {
    var canon = ragamKey(key);
    var r = state.ragams.get(canon) || { ml: canon, en: "" };
    return { en: r.en || r.ml, ml: r.en ? r.ml : "", count: r.count || 0 };
  }

  function renderRagams() {
    var list = ragamEntries();
    var html = crumbs([{ label: "Ragams" }]) +
      '<div class="pagehead"><div class="kicker">Browse</div><h1>Ragams</h1>' +
      '<div class="sub"><b>' + num(list.length) + "</b> ragams · <b>" + num(state.songs.length) + "</b> songs</div></div>" +
      '<div class="tools"><input id="filterBox" type="search" placeholder="Filter ragams…" autocomplete="off" />' +
      '<span class="mut" id="filterCount"></span></div>' +
      '<div class="letters elist" id="letters"></div>';
    layout(html);
    var box = el("filterBox");
    var letters = el("letters");
    var countEl = el("filterCount");

    function draw() {
      var q = box.value.trim().toLowerCase();
      var shown = q ? list.filter(function (e) {
        return (e.en + " " + (e.ml || "")).toLowerCase().indexOf(q) >= 0;
      }) : list;
      countEl.textContent = q ? num(shown.length) + " found" : "";
      letters.innerHTML = "";
      if (!shown.length) { letters.innerHTML = '<div class="nores">Nothing matches that filter.</div>'; return; }
      chunked(letters, shown, function (it) {
        var a = document.createElement("a");
        a.className = "ecard";
        a.href = hashFor(["ragam", it.key]);
        a.innerHTML = '<span class="name">' + esc(it.en) + (it.ml ? mlSpan(it.ml) : "") + "</span>" +
          '<span class="num">' + num(it.count) + "</span>";
        return a;
      }, function (it) { return letterOf(it.en); }, 240);
    }
    box.addEventListener("input", draw);
    draw();
  }

  function renderRagamSongs(ragaKey) {
    var canon = ragamKey(ragaKey);
    var r = ragamNameOf(canon);
    var ids = state.indexes.raga.get(canon) || [];
    songsView({
      crumbs: [{ label: "Ragams", href: "#/ragams" }, { label: r.en }],
      kicker: "Ragam",
      title: r.en,
      titleMl: r.ml || "",
      ids: ids,
      queueLabel: r.en,
      sub: num(new Set(ids.map(function (i) { return state.songs[i].movieId; })).size) + " " +
        plural(new Set(ids.map(function (i) { return state.songs[i].movieId; })).size, "movie")
    });
  }

  function renderYear(year) {
    var y = Number(year) || 0;
    var ids = state.indexes.year.get(String(y)) || [];
    songsView({
      crumbs: [{ label: "Years", href: "#/years" }, { label: y ? y : "Unknown" }],
      kicker: "Year",
      title: y ? y : "Unknown year",
      ids: ids,
      sub: num(new Set(ids.map(function (i) { return state.songs[i].movieId; })).size) + " " +
        plural(new Set(ids.map(function (i) { return state.songs[i].movieId; })).size, "movie")
    });
  }

  /* ---------------- movies ---------------- */
  function renderMovies() {
    var list = [];
    state.movies.forEach(function (m) { list.push(m); });
    list.sort(function (a, b) { return cmp(a.title || a.titleMl, b.title || b.titleMl); });
    var html = crumbs([{ label: "Movies" }]) +
      '<div class="pagehead"><div class="kicker">Browse</div><h1>Movies</h1>' +
      '<div class="sub"><b>' + num(list.length) + "</b> films in the database</div></div>" +
      '<div class="tools"><input id="filterBox" type="search" placeholder="Filter movies…" autocomplete="off" />' +
      '<span class="mut" id="filterCount"></span></div><div class="letters elist" id="letters"></div>';
    layout(html);

    var box = el("filterBox"), host = el("letters"), countEl = el("filterCount");
    function draw() {
      var q = box.value.trim().toLowerCase();
      var items = q ? list.filter(function (m) { return m.hay.indexOf(q) >= 0; }) : list;
      countEl.textContent = q ? num(items.length) + " found" : "";
      host.innerHTML = "";
      if (!items.length) { host.innerHTML = '<div class="nores">Nothing matches that filter.</div>'; return; }
      chunked(host, items, function (m) {
        var a = document.createElement("a");
        a.className = "ecard";
        a.href = hashFor(["movie", m.id]);
        a.innerHTML = '<span class="name">' + esc(m.title || m.titleMl) +
          (m.title && m.titleMl ? mlSpan(m.titleMl) : "") + "</span>" +
          '<span class="yr">' + (m.year || "") + "</span>" +
          '<span class="num">' + num(m.songIds.length) + "</span>";
        return a;
      }, function (m) { return letterOf(m.title || m.titleMl); }, 240);
    }
    box.addEventListener("input", draw);
    draw();
  }

  function renderMovie(id) {
    var m = state.movies.get(String(id));
    if (!m) { notFound("movie"); return; }
    var bits = [];
    if (m.year) bits.push('<a href="' + hashFor(["year", m.year]) + '">' + m.year + "</a>");
    if (m.music.length) bits.push("Music: " + chips("music", m.music));
    if (m.lyricist.length) bits.push("Lyrics: " + chips("lyricist", m.lyricist));
    if (m.director.length) bits.push("Directed by " + chips("director", m.director));
    if (isAdmin()) bits.push('<a href="' + hashFor(["admin", "movie", m.id]) + '">Edit</a>');
    bits.push('<a href="' + SOURCE + "m.php?" + encodeURIComponent(m.id) + '" target="_blank" rel="noopener">Source ↗</a>');
    var sub = bits.join(" · ");

    songsView({
      crumbs: [{ label: "Movies", href: "#/movies" }, { label: m.title || m.titleMl }],
      kicker: "Movie",
      title: m.title || m.titleMl,
      titleMl: m.title && m.titleMl ? m.titleMl : "",
      ids: m.songIds,
      sub: sub,
      emptyText: "No songs listed for this film.",
      comments: { kind: "movie", id: m.id, title: m.title || m.titleMl },
      poster: m.poster
    });
  }

  /* ---------------- song detail ---------------- */
  function chips(kind, people) {
    return people.length ? people.map(function (p) {
      var label = p.en || p.ml;
      return '<a class="chip" href="' + linkFor(kind, label) + '">' +
        esc(label) + (p.en && p.ml ? mlSpan(p.ml) : "") + "</a>";
    }).join(" ") : '<span class="dim">—</span>';
  }

  function ragaChips(raga) {
    var keys = String(raga || "").split(",").map(function (k) { return ragamKey(k.trim()); }).filter(Boolean);
    if (!keys.length) return '<span class="dim">—</span>';
    return keys.map(function (key) {
      var en = ragaEn(key);
      return '<a class="chip" href="' + hashFor(["ragam", key]) + '">' +
        esc(en || key) + (en ? mlSpan(key) : "") + "</a>";
    }).join(" ");
  }

  function renderSong(id) {
    var s = state.byId.get(String(id));
    if (!s) { notFound("song"); return; }
    var movieTitle = s.movie ? (s.movie.title || s.movie.titleMl) : "";
    var ytSearch = "https://www.youtube.com/results?search_query=" +
      encodeURIComponent((s.title || s.titleMl) + " " + movieTitle + " Malayalam song");

    var html = crumbs([{ label: "Song" }]) +
      '<div class="detail">' +
        "<div>" +
          '<div class="pagehead"><div class="kicker">Song</div>' +
          '<h1 class="songtitlebig">' + esc(s.title || s.titleMl) + "</h1>" +
          (s.title && s.titleMl ? '<div lang="ml" class="headml">' + esc(s.titleMl) + "</div>" : "") +
          '<div class="songmovie">' +
            (s.movieId ? '<a href="' + hashFor(["movie", s.movieId]) + '">' + esc(movieTitle) + "</a>" : esc(movieTitle)) +
            (s.movie && s.movie.title && s.movie.titleMl ? " " + mlSpan(s.movie.titleMl) : "") +
            (s.year ? ' · <a href="' + hashFor(["year", s.year]) + '">' + s.year + "</a>" : "") +
          "</div></div>" +
          '<div class="card"><h2>Credits</h2><dl class="dl">' +
            "<dt>Singers</dt><dd>" + chips("singer", s.singers) + "</dd>" +
            "<dt>Lyricist</dt><dd>" + chips("lyricist", s.lyricist) + "</dd>" +
            "<dt>Music</dt><dd>" + chips("music", s.music) + "</dd>" +
            (s.raga ? '<dt>Raaga</dt><dd>' + ragaChips(s.raga) + "</dd>" : "") +
            "<dt>Director</dt><dd>" + chips("director", s.director) + "</dd>" +
            "<dt>Year</dt><dd>" + (s.year ? '<a href="' + hashFor(["year", s.year]) + '">' + s.year + "</a>" : "—") + "</dd>" +
            "<dt>Movie</dt><dd>" + (s.movieId
              ? '<a href="' + hashFor(["movie", s.movieId]) + '">' + esc(movieTitle) + "</a>"
              : esc(movieTitle) || "—") + "</dd>" +
          "</dl>" +
          '<div class="actions">' +
            '<button class="btn primary" id="songPlay">▶ Play</button>' +
            '<a class="btn" href="' + ytSearch + '" target="_blank" rel="noopener">Search on YouTube ↗</a>' +
            '<a class="btn" href="' + SOURCE + "s.php?" + encodeURIComponent(s.id) + '" target="_blank" rel="noopener">Source page ↗</a>' +
            (isAdmin() ? '<a class="btn" href="' + hashFor(["admin", "song", s.id]) + '">Edit</a>' : "") +
          "</div></div>" +
        "</div>" +
        '<aside class="card"><h2>More from this movie</h2><div id="moreFromMovie" class="slist"></div></aside>' +
      "</div>" +
      commentsSection("song", s.id, s.title || s.titleMl);
    layout(html);

    el("songPlay").addEventListener("click", function () {
      if (!hasVideo(s)) { toast("No YouTube video has been matched for this song yet."); return; }
      var ids = (s.movie && s.movie.songIds.length) ? s.movie.songIds : [s.i];
      playQueue(ids, s.movie ? (s.movie.title || s.movie.titleMl) : (s.title || s.titleMl), s.i);
    });

    var m = s.movie;
    if (m && m.songIds.length > 1) {
      var others = m.songIds.filter(function (i) { return i !== s.i; }).slice(0, 12)
        .map(function (i) { return state.songs[i]; });
      var host = el("moreFromMovie");
      others.forEach(function (o, n) {
        var a = document.createElement("a");
        a.className = "srow side";
        a.href = hashFor(["song", o.id]);
        a.innerHTML = '<span class="n">' + (n + 1) + "</span>" +
          '<span class="t">' +
            '<span class="tt">' + esc(o.title || o.titleMl) + "</span>" +
            (o.title && o.titleMl ? mlSpan(o.titleMl, "tml") : "") +
            '<span class="ts">' + esc(namesOf(o.singers) || "—") + "</span>" +
          "</span>";
        host.appendChild(a);
      });
    } else {
      el("moreFromMovie").innerHTML = '<div class="dim" style="font-size:13px">No other songs listed.</div>';
    }
    wireComments("song", s.id, s.title || s.titleMl);
  }

  function notFound(what) {
    layout(crumbs([{ label: "Not found" }]) +
      '<div class="pagehead"><h1>Not found</h1><div class="sub">That ' + esc(what) +
      " is not in the database. <a href=\"#/\">Go home</a>.</div></div>");
  }

  /* ---------------- comments ----------------
     The form writes to a Google Sheet. A small Apps Script web app in that
     sheet returns the latest comments for one item as JSONP, because a static
     page cannot read the sheet directly. See comments/SETUP.md. */
  var jsonpSeq = 0;

  function commentsConfig() {
    var c = window.MSI_COMMENTS;
    return (c && c.formUrl && c.apiUrl) ? c : null;
  }

  function jsonp(url, params, timeoutMs) {
    return new Promise(function (resolve, reject) {
      var name = "__msiJsonp" + (++jsonpSeq) + "_" + Math.random().toString(36).slice(2, 8);
      var script = document.createElement("script");
      var timer = setTimeout(function () {
        finish();
        reject(new Error("The comments service did not answer."));
      }, timeoutMs || 12000);
      function finish() {
        clearTimeout(timer);
        try { delete window[name]; } catch (e) { window[name] = undefined; }
        if (script.parentNode) script.parentNode.removeChild(script);
      }
      window[name] = function (data) { finish(); resolve(data); };
      var q = Object.keys(params).map(function (k) {
        return encodeURIComponent(k) + "=" + encodeURIComponent(params[k]);
      }).join("&");
      script.src = url + (url.indexOf("?") < 0 ? "?" : "&") + q +
        "&callback=" + encodeURIComponent(name);
      script.onerror = function () {
        finish();
        reject(new Error("The comments service could not be reached."));
      };
      document.head.appendChild(script);
    });
  }

  function commentFormUrl(kind, id, title) {
    var c = commentsConfig();
    if (!c) return "";
    var entries = c.entries || {};
    var parts = ["usp=pp_url"];
    [["kind", kind], ["id", id], ["title", title || ""]].forEach(function (pair) {
      if (entries[pair[0]]) {
        parts.push(encodeURIComponent(entries[pair[0]]) + "=" + encodeURIComponent(pair[1]));
      }
    });
    return c.formUrl + (c.formUrl.indexOf("?") < 0 ? "?" : "&") + parts.join("&");
  }

  /* The Google Form's own submission endpoint. The themed form posts here in a
     hidden iframe, so Google records the row without showing its white UI. */
  function commentActionUrl() {
    var c = commentsConfig();
    if (!c) return "";
    var url = c.formUrl.split("?")[0];
    if (/\/formResponse$/.test(url)) return url;
    if (/\/viewform$/.test(url)) return url.slice(0, -"/viewform".length) + "/formResponse";
    return url.replace(/\/$/, "") + "/formResponse";
  }

  function commentsSection(kind, id, title) {
    var c = commentsConfig();
    if (!c) return "";
    var entries = c.entries || {};
    var fields = [
      ["kind", kind], ["id", id], ["title", title || ""]
    ].filter(function (pair) {
      return !!entries[pair[0]];
    }).map(function (pair) {
      return '<input type="hidden" name="' + esc(entries[pair[0]]) + '" value="' + esc(pair[1]) + '">';
    }).join("");
    var prefill = commentFormUrl(kind, id, title);

    return '<section class="card comments" id="comments" data-kind="' + esc(kind) +
      '" data-id="' + esc(id) + '">' +
      '<div class="cmhead"><h2>Comments</h2><span class="cmcount" id="cmCount"></span>' +
        '<div class="cmactions">' +
          '<button class="btn" type="button" id="cmRefresh">Refresh</button>' +
          '<button class="btn primary" type="button" id="cmWrite">Write a comment</button>' +
        "</div></div>" +
      '<div class="cmlist" id="cmList" aria-live="polite"><p class="mut">Loading comments…</p></div>' +
      '<form class="cmform" id="cmForm" method="post" action="' + esc(commentActionUrl()) +
        '" target="cmPostFrame" hidden>' +
        fields +
        '<input type="hidden" name="fvv" value="1">' +
        '<input type="hidden" name="pageHistory" value="0">' +
        '<div class="cmfields">' +
          '<label class="cmfield"><span class="cmlabel">Your name <span class="mut">(optional)</span></span>' +
            '<input id="cmName" name="' + esc(entries.name || "") +
              '" maxlength="80" autocomplete="nickname" placeholder="How should we credit you?">' +
          "</label>" +
          '<label class="cmfield"><span class="cmlabel">Comment</span>' +
            '<textarea id="cmText" name="' + esc(entries.text || "") +
              '" rows="4" maxlength="2000" required placeholder="Share a memory or thought about this song…"></textarea>' +
          "</label>" +
        "</div>" +
        '<div class="cmformbar">' +
          '<button class="btn primary" type="submit" id="cmSubmit">Post comment</button>' +
          '<button class="btn" type="button" id="cmClose">Cancel</button>' +
          '<a class="btn" id="cmOpen" href="' + esc(prefill) +
            '" target="_blank" rel="noopener">Open the Google Form ↗</a>' +
          '<span class="cmmsg" id="cmMsg" role="status" aria-live="polite"></span>' +
        "</div>" +
        '<p class="mut cmnote">Your comment and name are public on this page. ' +
        "Please keep it about the song and civil.</p>" +
        '<iframe id="cmPostFrame" name="cmPostFrame" title="Comment submission" hidden></iframe>' +
      "</form>" +
      '<p class="mut cmnote">Comments are moderated by the site owner.</p>' +
      "</section>";
  }

  function relTime(value) {
    var t = Date.parse(value);
    if (!isFinite(t)) return String(value || "");
    var diff = Date.now() - t;
    if (diff < 0) diff = 0;
    var min = Math.floor(diff / 60000);
    if (min < 1) return "just now";
    if (min < 60) return min + " min ago";
    var hr = Math.floor(min / 60);
    if (hr < 24) return hr + " h ago";
    var day = Math.floor(hr / 24);
    if (day < 7) return day === 1 ? "1 day ago" : day + " days ago";
    return new Date(t).toLocaleDateString("en-IN", {
      year: "numeric", month: "short", day: "numeric"
    });
  }

  function drawComments(list, items, countEl) {
    list.innerHTML = "";
    list.removeAttribute("aria-busy");
    if (countEl) countEl.textContent = items.length ? "(" + items.length + ")" : "";
    if (!items.length) {
      list.innerHTML = '<p class="mut cempty">No comments yet — be the first to write one.</p>';
      return;
    }
    chunked(list, items, function (c) {
      var art = document.createElement("article");
      art.className = "citem";
      var name = String(c.n || "").trim() || "Listener";
      var when = c.t ? relTime(c.t) : "";
      art.innerHTML = '<div class="cmet"><span class="cname">' + esc(name) + "</span>" +
        (when ? '<span class="cdate">' + esc(when) + "</span>" : "") + "</div>" +
        '<div class="ctext">' + esc(String(c.m || "").trim()) + "</div>";
      return art;
    }, null, 20);
  }

  function loadComments(kind, id, list, countEl, btn) {
    var c = commentsConfig();
    if (!c) return;
    list.setAttribute("aria-busy", "true");
    if (!list.querySelector(".citem")) list.innerHTML = '<p class="mut">Loading comments…</p>';
    if (btn) btn.disabled = true;
    jsonp(c.apiUrl, { kind: kind, id: id }).then(function (data) {
      if (data && data.ok === false) {
        throw new Error(data.error || "The comments service returned an error.");
      }
      var items = data && Array.isArray(data.comments) ? data.comments : [];
      drawComments(list, items, countEl);
    }).catch(function (err) {
      list.removeAttribute("aria-busy");
      list.innerHTML = '<p class="mut">Comments could not be loaded right now. ' +
        '<button class="btn" type="button" id="cmRetry">Try again</button></p>' +
        '<p class="mut cmnote">' + esc(err && err.message ? err.message : "") + "</p>";
      var retry = list.querySelector("#cmRetry");
      if (retry) {
        retry.addEventListener("click", function () { loadComments(kind, id, list, countEl, btn); });
      }
    }).then(function () {
      if (btn) btn.disabled = false;
    });
  }

  function wireComments(kind, id, title) {
    var box = el("comments");
    if (!box || !commentsConfig()) return;
    var list = el("cmList"), countEl = el("cmCount");
    var form = el("cmForm"), frame = el("cmPostFrame");
    var submit = el("cmSubmit"), msg = el("cmMsg");
    var posting = false, postTimer = null;

    function setMsg(text, bad) {
      if (!msg) return;
      msg.textContent = text || "";
      msg.className = "cmmsg" + (bad ? " bad" : "");
    }

    function refresh() {
      loadComments(kind, id, list, countEl, el("cmRefresh"));
    }

    el("cmRefresh").addEventListener("click", refresh);

    el("cmWrite").addEventListener("click", function () {
      form.hidden = false;
      form.scrollIntoView({ behavior: "smooth", block: "nearest" });
      var name = el("cmName");
      if (name) name.focus();
    });

    el("cmClose").addEventListener("click", function () {
      form.hidden = true;
      setMsg("");
    });

    form.addEventListener("submit", function (ev) {
      if (posting) { ev.preventDefault(); return; }
      if (!el("cmText").value.trim()) {
        ev.preventDefault();
        setMsg("Please write a comment first.", true);
        el("cmText").focus();
        return;
      }
      posting = true;
      submit.disabled = true;
      setMsg("Posting…");
      clearTimeout(postTimer);
      postTimer = setTimeout(function () {
        if (!posting) return;
        posting = false;
        submit.disabled = false;
        setMsg("The form did not confirm the post. Try the Google Form link if it doesn't appear.", true);
      }, 15000);
    });

    /* The hidden iframe loads Google's confirmation page when the POST is
       accepted. The response is cross-origin, so we can only use the load
       event — then re-read the sheet. */
    frame.addEventListener("load", function () {
      if (!posting) return;
      posting = false;
      clearTimeout(postTimer);
      submit.disabled = false;
      form.reset();
      setMsg("Comment submitted — it may take a moment to appear.");
      setTimeout(refresh, 1500);
    });

    refresh();
  }

  /* ---------------- search ---------------- */
  function renderSearch(q) {
    var needle = q.toLowerCase();
    var songHits = [];
    for (var i = 0; i < state.songs.length; i++) {
      var s = state.songs[i];
      if (s.hay.indexOf(needle) >= 0) songHits.push(s);
    }
    songHits.sort(function (a, b) { return (b.year || 0) - (a.year || 0) || cmp(a.title, b.title); });
    var shown = songHits.slice(0, 300);

    var entHits = [];
    state.movies.forEach(function (m) {
      if (entHits.length < 6 && m.hay.indexOf(needle) >= 0 && m.title) {
        entHits.push({
          href: hashFor(["movie", m.id]), name: m.title, ml: m.titleMl,
          label: "film", count: m.songIds.length
        });
      }
    });
    ["singers", "music", "lyricists", "directors"].forEach(function (k) {
      var kind = KINDS[k];
      var list = entityEntries(state.indexes[kind.key]).filter(function (e) {
        return (e.name + " " + e.ml).toLowerCase().indexOf(needle) >= 0;
      }).slice(0, 8);
      list.forEach(function (e) {
        entHits.push({ href: hashFor([kind.route, e.name]), name: e.name, ml: e.ml, label: kind.singular, count: e.count });
      });
    });
    ragamEntries().filter(function (e) {
      return (e.en + " " + (e.ml || "")).toLowerCase().indexOf(needle) >= 0;
    }).slice(0, 8).forEach(function (e) {
      entHits.push({ href: hashFor(["ragam", e.key]), name: e.en, ml: e.ml, label: "ragam", count: e.count });
    });

    var html = '<div class="pagehead"><div class="kicker">Search</div><h1>' + esc(q) + "</h1>" +
      '<div class="sub">' + num(songHits.length) + " song " + plural(songHits.length, "match", "matches") +
      (songHits.length > 300 ? " (showing first 300)" : "") + " · " + num(entHits.length) + " name " +
      plural(entHits.length, "match", "matches") + "</div></div>";

    if (songHits.length) {
      html += '<div class="tools"><div class="seg playseg">' +
        '<button id="searchPlay">▶ Play all matches</button>' +
        '<button id="searchShuffle">🔀 Shuffle</button></div>' +
        '<span class="mut">' + num(state.videos.size) + " songs have videos</span></div>";
    }

    if (entHits.length) {
      html += '<div class="sectionhead"><h2>Names</h2></div><div class="elist">';
      entHits.forEach(function (e) {
        html += '<a class="ecard" href="' + e.href + '">' +
          '<span class="name">' + esc(e.name) + (e.ml ? mlSpan(e.ml) : "") +
          ' <span class="pill">' + esc(e.label) + "</span></span>" +
          '<span class="num">' + num(e.count) + "</span></a>";
      });
      html += "</div>";
    }
    html += '<div class="sectionhead"><h2>Songs</h2></div><div class="slist" id="searchList"></div>';
    layout(html);
    if (songHits.length) {
      var hitIds = songHits.map(function (s) { return s.i; });
      el("searchPlay").addEventListener("click", function () { playQueue(hitIds, 'Search: "' + q + '"'); });
      el("searchShuffle").addEventListener("click", function () { shuffleQueue(hitIds, 'Search: "' + q + '"'); });
    }
    if (shown.length) {
      chunked(el("searchList"), shown, function (s, n) { return songRow(s, n + 1); }, null, 200);
    } else {
      el("searchList").innerHTML = '<div class="nores">No songs match “' + esc(q) + "”.</div>";
    }
  }

  /* ---------------- YouTube player ---------------- */
  var ytApi = { loading: false, ready: false, cbs: [] };

  function hasVideo(s) { return !!(s && state.videos.get(s.id)); }
  function videoOf(s) { return s ? state.videos.get(s.id) : null; }
  function allPlayable() {
    return state.songs.filter(hasVideo).map(function (s) { return s.i; });
  }

  function toast(msg, ms) {
    ms = ms || 2800;
    var t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.classList.add("out"); }, ms);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, ms + 800);
  }

  function fmtTime(sec) {
    sec = Math.max(0, Math.floor(sec || 0));
    var m = Math.floor(sec / 60), s = sec % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function shuffled(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  var player = {
    queue: [],        // song indexes in base order
    order: [],        // positions into queue, in play order
    pos: -1,
    shuffle: false,
    listOpen: false,
    listPref: null,
    tab: "now",        // "now" = details + related songs, "list" = queue
    nowGroups: [],
    currentSong: null,
    currentVideo: null,
    pendingVideo: null,
    yt: null,
    ready: false,
    timer: null,
    dragging: false,
    blocked: {},
    label: "",
    playing: false
  };

  function showBar() {
    var bar = el("playerBar");
    if (!bar) return;
    bar.hidden = false;
    document.body.classList.add("hasplayer");
    requestAnimationFrame(layoutPlayer);
  }

  function layoutPlayer() {
    var bar = el("playerBar");
    if (!bar || bar.hidden) { document.body.style.paddingBottom = ""; return; }
    var v = el("pbVideo");
    var barH = bar.offsetHeight || 0;
    var vidH = (v && !v.classList.contains("hidden")) ? v.offsetHeight + 10 : 0;
    var q = el("pbQueue");
    var qH = (q && player.listOpen && !q.hidden) ? q.offsetHeight + 10 : 0;
    document.documentElement.style.setProperty("--playerbarh", barH + "px");
    document.body.style.paddingBottom = (barH + Math.max(vidH, qH) + 18) + "px";
  }

  function setPlayIcon(on) {
    var b = el("pbPlay");
    if (b) { b.textContent = on ? "❚❚" : "▶"; b.setAttribute("aria-label", on ? "Pause" : "Play"); }
  }

  function updateShuffleUI() {
    var b = el("pbShuffle");
    if (b) b.classList.toggle("on", player.shuffle);
  }

  /* ---------------- playlist drawer ---------------- */
  var QROW = 54;      // fixed row height, used by the virtual scroller
  var qFrame = 0;

  function queueSongAt(p) {
    var q = player.order[p];
    if (q == null) return null;
    return state.songs[player.queue[q]] || null;
  }

  function setQueueSub() {
    var sub = el("pbQSub"), n = player.order.length;
    if (!sub) return;
    sub.textContent = (player.pos >= 0 && player.pos < n)
      ? "Song " + num(player.pos + 1) + " of " + num(n)
      : (n ? num(n) + " songs" : "");
  }

  function renderQueue() {
    if (!player.listOpen) return;
    var listEl = el("pbQList"), spacer = el("pbQSpacer");
    if (!listEl || !spacer) return;
    setQueueSub();
    var n = player.order.length;
    spacer.style.height = (n * QROW + 6) + "px";
    var top = listEl.scrollTop || 0;
    var h = listEl.clientHeight || 300;
    var first = Math.max(0, Math.floor(top / QROW) - 4);
    var last = Math.min(n, Math.ceil((top + h) / QROW) + 6);
    var html = "";
    for (var p = first; p < last; p++) {
      var s = queueSongAt(p);
      if (!s) continue;
      var film = s.movie ? (s.movie.title || s.movie.titleMl) : "";
      html += '<div class="pbqrow' + (p === player.pos ? " cur" : "") + '" data-q="' + p + '" style="top:' + (p * QROW) + 'px">' +
        '<span class="pbqnum">' + (p === player.pos ? "▶" : num(p + 1)) + "</span>" +
        '<span class="pbqtext"><span class="pbqname">' + esc(s.title || s.titleMl) + "</span>" +
        (film ? '<span class="pbqfilm">' + esc(film) + (s.year ? " · " + s.year : "") + "</span>" : "") +
        "</span></div>";
    }
    spacer.innerHTML = html;
  }

  function scrollQueueToCurrent() {
    var listEl = el("pbQList");
    if (!listEl || player.pos < 0) return;
    listEl.scrollTop = Math.max(0, player.pos * QROW - Math.floor(listEl.clientHeight / 2) + QROW / 2);
    renderQueue();
  }

  function syncQueue() {
    if (!player.listOpen) return;
    var listEl = el("pbQList");
    if (!listEl) return;
    var t = player.pos * QROW, vt = listEl.scrollTop, vb = vt + listEl.clientHeight;
    if (player.pos < 0 || t < vt || t + QROW > vb) scrollQueueToCurrent();
    else renderQueue();
  }

  /* ---------------- now playing: details + related songs ---------------- */

  function applyDrawerTab() {
    var now = el("pbQNow"), list = el("pbQList");
    if (now) now.hidden = player.tab !== "now";
    if (list) list.hidden = player.tab !== "list";
    var bn = el("pbTabNow"), bl = el("pbTabList");
    if (bn) {
      bn.classList.toggle("on", player.tab === "now");
      bn.setAttribute("aria-selected", player.tab === "now" ? "true" : "false");
    }
    if (bl) {
      bl.classList.toggle("on", player.tab === "list");
      bl.setAttribute("aria-selected", player.tab === "list" ? "true" : "false");
    }
  }

  function setDrawerTab(tab) {
    player.tab = (tab === "list") ? "list" : "now";
    applyDrawerTab();
    if (!player.listOpen) return;
    if (player.tab === "list") {
      requestAnimationFrame(function () { scrollQueueToCurrent(); layoutPlayer(); });
    } else {
      renderNow();
      layoutPlayer();
    }
  }

  function refreshDrawer() {
    if (!player.listOpen) return;
    if (player.tab === "list") syncQueue();
    else renderNow();
  }

  function openNow() {
    if (!player.currentSong) return;
    player.tab = "now";
    if (!player.listOpen) { toggleQueue(true); return; }
    applyDrawerTab();
    renderNow();
    layoutPlayer();
  }

  function ytSearchFor(s) {
    var movieTitle = s.movie ? (s.movie.title || s.movie.titleMl) : "";
    return "https://www.youtube.com/results?search_query=" +
      encodeURIComponent((s.title || s.titleMl) + " " + movieTitle + " Malayalam song");
  }

  function nowGroups(s) {
    var groups = [];
    function add(key, label, ids, href) {
      var seen = {}, list = [];
      (ids || []).forEach(function (i) {
        if (i === s.i || seen[i]) return;
        var t = state.songs[i];
        if (!t || !hasVideo(t)) return;
        seen[i] = 1;
        list.push(i);
      });
      if (list.length) groups.push({ key: key, label: label, ids: list, href: href || "" });
    }

    var idx = state.indexes;
    if (s.movie && s.movie.songIds.length) {
      add("film", "More from " + (s.movie.title || s.movie.titleMl), s.movie.songIds,
        hashFor(["movie", s.movie.id]));
    }
    s.singers.slice(0, 2).forEach(function (p, n) {
      add("singer" + n, "More by " + (p.en || p.ml), idx.singer.get(p.key),
        linkFor("singer", p.en || p.ml));
    });
    s.lyricist.slice(0, 2).forEach(function (p, n) {
      add("lyricist" + n, "Written by " + (p.en || p.ml), idx.lyricist.get(p.key),
        linkFor("lyricist", p.en || p.ml));
    });
    s.music.slice(0, 2).forEach(function (p, n) {
      add("music" + n, "Music by " + (p.en || p.ml), idx.music.get(p.key),
        linkFor("music", p.en || p.ml));
    });
    if (s.year) {
      add("year", "More from " + s.year, idx.year.get(String(s.year)),
        hashFor(["year", s.year]));
    }
    s.director.slice(0, 1).forEach(function (p) {
      add("director", "Directed by " + (p.en || p.ml), idx.director.get(p.key),
        linkFor("director", p.en || p.ml));
    });
    return groups;
  }

  function renderNow() {
    if (!player.listOpen || player.tab !== "now") return;
    var box = el("pbQNow");
    if (!box) return;
    setQueueSub();
    var s = player.currentSong;
    if (!s) {
      box.innerHTML = '<p class="pnnone">Nothing is playing yet. Pick a song to see its credits and related songs here.</p>';
      return;
    }

    var movieTitle = s.movie ? (s.movie.title || s.movie.titleMl) : "";
    var groups = nowGroups(s);
    player.nowGroups = groups;

    var html = '<div class="pnhead">' +
      '<div class="pnk">Song details</div>' +
      '<div class="pntitle">' + esc(s.title || s.titleMl) + "</div>" +
      (s.title && s.titleMl ? '<div class="pntitleMl" lang="ml">' + esc(s.titleMl) + "</div>" : "") +
      '<div class="pnsub">' +
        (s.movieId ? '<a href="' + hashFor(["movie", s.movieId]) + '">' + esc(movieTitle) + "</a>" : esc(movieTitle)) +
        (s.year ? ' · <a href="' + hashFor(["year", s.year]) + '">' + s.year + "</a>" : "") +
      "</div>" +
      '<dl class="pndl">' +
        "<dt>Singers</dt><dd>" + chips("singer", s.singers) + "</dd>" +
        "<dt>Lyricist</dt><dd>" + chips("lyricist", s.lyricist) + "</dd>" +
        "<dt>Music</dt><dd>" + chips("music", s.music) + "</dd>" +
        (s.raga ? '<dt>Raaga</dt><dd>' + ragaChips(s.raga) + "</dd>" : "") +
        (s.director.length ? "<dt>Director</dt><dd>" + chips("director", s.director) + "</dd>" : "") +
      "</dl>" +
      '<div class="pnactions">' +
        '<a class="btn" href="' + hashFor(["song", s.id]) + '">Song page</a>' +
        (hasVideo(s) ? '<a class="btn" href="https://www.youtube.com/watch?v=' +
          encodeURIComponent(videoOf(s).id) + '" target="_blank" rel="noopener">YouTube ↗</a>' : "") +
        '<a class="btn" href="' + ytSearchFor(s) + '" target="_blank" rel="noopener">Search ↗</a>' +
      "</div></div>";

    if (!groups.length) {
      html += '<p class="pnnone">No other matched videos to suggest yet. The film and artist pages list every song.</p>';
    } else {
      groups.forEach(function (g, gi) {
        html += '<div class="pngroup"><div class="pnghead"><span class="pngtitle">' + esc(g.label) + "</span>" +
          (g.href ? '<a class="pngmore" href="' + g.href + '">See all →</a>' : "") + "</div>";
        g.ids.slice(0, 6).forEach(function (i) {
          var t = state.songs[i];
          var film = t.movie ? (t.movie.title || t.movie.titleMl) : "";
          html += '<button type="button" class="pbnowsong" data-g="' + gi + '" data-i="' + t.i + '">' +
            '<span class="pnT">' + esc(t.title || t.titleMl) +
              (t.title && t.titleMl ? ' <span class="pnMl" lang="ml">' + esc(t.titleMl) + "</span>" : "") + "</span>" +
            '<span class="pnS">' + esc(film) + (t.year ? " · " + t.year : "") + "</span></button>";
        });
        html += "</div>";
      });
      html += '<p class="pnnone">Related lists include only songs with a matched video.</p>';
    }
    box.innerHTML = html;
    box.scrollTop = 0;
  }

  function toggleQueue(force) {
    if (!el("pbQueue")) return;
    var on = (force == null) ? !player.listOpen : !!force;
    player.listOpen = on;
    player.listPref = on;
    var box = el("pbQueue"), btn = el("pbList");
    if (on) {
      box.hidden = false;
      document.body.classList.add("queueopen");
      applyDrawerTab();
      requestAnimationFrame(function () {
        if (player.tab === "list") scrollQueueToCurrent();
        else renderNow();
        layoutPlayer();
      });
    } else {
      box.hidden = true;
      document.body.classList.remove("queueopen");
      layoutPlayer();
    }
    if (btn) {
      btn.classList.toggle("on", on);
      btn.setAttribute("aria-expanded", on ? "true" : "false");
    }
  }

  // open the drawer with a new queue unless the listener minimized it
  function openQueueForPlay() {
    if (player.listPref === false) { refreshDrawer(); return; }
    if (player.listOpen) { refreshDrawer(); return; }
    toggleQueue(true);
  }

  function playAt(p) {
    if (p < 0 || p >= player.order.length) return;
    player.pos = p;
    var s = queueSongAt(p);
    var v = videoOf(s);
    if (!s || !v || player.blocked[v.id]) { toast("That video can’t be played."); refreshDrawer(); return; }
    startSong(s, v);
  }

  function updateBar() {
    var s = player.currentSong;
    if (!s) return;
    var movie = s.movie ? (s.movie.title || s.movie.titleMl) : "";
    el("pbTitle").textContent = s.title || s.titleMl;
    var bits = [];
    if (player.label) bits.push('<span class="pbq">' + esc(player.label) + "</span>");
    if (movie && movie !== player.label) bits.push(esc(movie));
    if (s.year) bits.push(String(s.year));
    var singers = namesOf(s.singers);
    if (singers) bits.push(esc(singers));
    el("pbSub").innerHTML = bits.join(" · ");
    layoutPlayer();
  }

  function updateProgress() {
    if (!player.yt || !player.yt.getDuration) return;
    var d = player.yt.getDuration() || 0;
    var t = player.yt.getCurrentTime() || 0;
    el("pbDur").textContent = fmtTime(d);
    if (!player.dragging) {
      el("pbCur").textContent = fmtTime(t);
      el("pbSeek").value = d ? Math.round(t / d * 1000) : 0;
    }
    updateMediaPosition();
  }

  function startTimer() {
    if (player.timer) return;
    player.timer = setInterval(updateProgress, 500);
  }

  function stopTimer() {
    if (player.timer) { clearInterval(player.timer); player.timer = null; }
  }

  /* ---------------- media session (lock screen / background playback) ---------------- */
  function songArtwork(s) {
    var poster = s && s.movie && s.movie.poster ? s.movie.poster : "";
    if (poster) return [{ src: poster, sizes: "512x512", type: "image/jpeg" }];
    return [];
  }

  function updateMediaSession() {
    if (!("mediaSession" in navigator)) return;
    var s = player.currentSong;
    if (!s) {
      try { navigator.mediaSession.metadata = null; } catch (e) { }
      try { navigator.mediaSession.playbackState = "none"; } catch (e) { }
      return;
    }
    var movie = (s.movie && (s.movie.title || s.movie.titleMl)) || "";
    var singers = namesOf(s.singers) || "";
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: s.title || s.titleMl || "Song",
        artist: singers,
        album: (movie ? movie : "") + (s.year ? (movie ? " · " : "") + s.year : ""),
        artwork: songArtwork(s)
      });
    } catch (e) { }
    var ms = navigator.mediaSession;
    function safe(action, fn) { try { ms.setActionHandler(action, fn); } catch (e) { } }
    safe("play", function () { if (player.yt) player.yt.playVideo(); });
    safe("pause", function () { if (player.yt) player.yt.pauseVideo(); });
    safe("nexttrack", function () { next(); });
    safe("previoustrack", function () { prev(); });
    safe("seekto", function (d) {
      if (player.yt && player.yt.seekTo && d && d.seekTime != null) player.yt.seekTo(Math.max(0, d.seekTime), true);
    });
    safe("seekforward", function () {
      if (player.yt && player.yt.getCurrentTime) player.yt.seekTo((player.yt.getCurrentTime() || 0) + 15, true);
    });
    safe("seekbackward", function () {
      if (player.yt && player.yt.getCurrentTime) player.yt.seekTo(Math.max(0, (player.yt.getCurrentTime() || 0) - 15), true);
    });
    safe("stop", function () { if (player.yt && player.yt.stopVideo) player.yt.stopVideo(); });
    try { ms.playbackState = player.playing ? "playing" : "paused"; } catch (e) { }
  }

  function updateMediaPosition() {
    var ms = navigator.mediaSession;
    if (!ms || !ms.setPositionState || !player.yt || !player.yt.getDuration) return;
    try {
      var d = player.yt.getDuration() || 0;
      var t = player.yt.getCurrentTime() || 0;
      if (d > 0) ms.setPositionState({ duration: d, playbackRate: 1, position: Math.min(Math.max(0, t), d) });
    } catch (e) { }
  }

  /* ---------------- Picture-in-Picture (desktop Chrome/Edge) ---------------- */
  var pipWindow = null;

  /* On coarse-pointer devices, Chromium/iOS suspend the YouTube iframe as soon
     as the user leaves the browser. Say so once per session and point at the
     routes that do work (Samsung Internet background play, YouTube app). */
  function maybeMobileBgHint() {
    try {
      if (!window.matchMedia || !window.matchMedia("(pointer: coarse)").matches) return;
      if (sessionStorage.getItem("msi.bghint")) return;
      sessionStorage.setItem("msi.bghint", "1");
      toast("On this phone, YouTube pauses when you switch apps. For background play, use Samsung Internet (free), or open the video in the YouTube app from the song page.", 9000);
    } catch (e) { }
  }

  function openPipWindow() {
    if (!window.documentPictureInPicture) {
      toast("Pop-out works on Chrome/Edge desktop. On mobile, use the notification media controls to keep playing with the screen locked.");
      return;
    }
    if (!player.currentSong || !player.currentVideo) {
      toast("Play a song first, then pop it out.");
      return;
    }
    if (pipWindow) { try { pipWindow.close(); } catch (e) { } pipWindow = null; return; }
    var s = player.currentSong;
    var v = player.currentVideo;
    var vid = v && v.id ? v.id : "";
    var startAt = 0;
    try { startAt = Math.max(0, Math.floor(player.yt && player.yt.getCurrentTime ? player.yt.getCurrentTime() || 0 : 0)); } catch (e) { }
    var wasPlaying = !!player.playing;

    documentPictureInPicture.requestWindow({ width: 420, height: 320 }).then(function (pw) {
      pipWindow = pw;
      var pipPlayer = null;
      var reached = startAt;
      var tick = setInterval(function () {
        try { if (pipPlayer && pipPlayer.getCurrentTime) reached = pipPlayer.getCurrentTime(); } catch (e) { }
      }, 1000);

      function finish() {
        clearInterval(tick);
        pipWindow = null;
        if (player.yt && player.yt.loadVideoById && vid && player.currentVideo === v) {
          try {
            player.yt.loadVideoById(vid, Math.max(0, Math.floor(reached)));
            if (!wasPlaying && player.yt.pauseVideo) player.yt.pauseVideo();
          } catch (e) { }
        }
      }
      pw.addEventListener("pagehide", finish);

      try {
        var doc = pw.document;
        doc.title = "Now playing — MalayalaSangeetham";
        var st = doc.createElement("style");
        st.textContent =
          "body{margin:0;background:#0d1015;color:#e8edf3;font-family:system-ui,'Segoe UI',sans-serif;display:flex;flex-direction:column;height:100vh;overflow:hidden}" +
          ".piptitle{padding:10px 12px 2px;font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
          ".pipsub{padding:0 12px 8px;font-size:12px;color:#94a3b8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
          ".pipmount{flex:1;min-height:0;background:#000}" +
          ".pipmount iframe,.pipmount>div{width:100%;height:100%;display:block;border:0}";
        doc.head.appendChild(st);

        var title = doc.createElement("div");
        title.className = "piptitle";
        title.textContent = (s.title || s.titleMl || "Now playing");
        var sub = doc.createElement("div");
        sub.className = "pipsub";
        sub.textContent = ((namesOf(s.singers) || "") + ((s.movie && (s.movie.title || s.movie.titleMl)) ? " · " + (s.movie.title || s.movie.titleMl) : ""));
        var mount = doc.createElement("div");
        mount.className = "pipmount";
        var target = doc.createElement("div");
        mount.appendChild(target);
        doc.body.appendChild(title);
        doc.body.appendChild(sub);
        doc.body.appendChild(mount);

        if (vid && window.YT && window.YT.Player) {
          try {
            pipPlayer = new window.YT.Player(target, {
              videoId: vid,
              playerVars: { autoplay: 1, controls: 1, rel: 0, playsinline: 1, start: startAt },
              events: {
                onReady: function (ev) { try { ev.target.playVideo(); } catch (e) { } }
              }
            });
          } catch (e) {
            var iframe = doc.createElement("iframe");
            iframe.src = "https://www.youtube.com/embed/" + encodeURIComponent(vid) + "?autoplay=1&start=" + startAt;
            iframe.allow = "autoplay; encrypted-media";
            target.appendChild(iframe);
          }
        } else if (vid) {
          var iframe2 = doc.createElement("iframe");
          iframe2.src = "https://www.youtube.com/embed/" + encodeURIComponent(vid) + "?autoplay=1&start=" + startAt;
          iframe2.allow = "autoplay; encrypted-media";
          target.appendChild(iframe2);
        }
      } catch (e) {
        clearInterval(tick);
        try { pw.close(); } catch (e2) { }
        pipWindow = null;
        toast("Could not open the pop-out player.");
      }
    }).catch(function () { pipWindow = null; toast("The browser blocked the pop-out window."); });
  }

  function ensureYT(cb) {
    if (ytApi.ready || (window.YT && window.YT.Player)) {
      ytApi.ready = true;
      cb();
      return;
    }
    ytApi.cbs.push(cb);
    if (ytApi.loading) return;
    ytApi.loading = true;
    window.onYouTubeIframeAPIReady = function () {
      ytApi.ready = true;
      var cbs = ytApi.cbs.slice();
      ytApi.cbs.length = 0;
      cbs.forEach(function (f) { try { f(); } catch (e) { } });
    };
    var s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    s.async = true;
    s.onerror = function () { ytApi.loading = false; toast("Could not load the YouTube player."); };
    document.head.appendChild(s);
    setTimeout(function () {
      if (!ytApi.ready) { ytApi.loading = false; toast("The YouTube player is taking too long to load."); }
    }, 12000);
  }

  function createYt(videoId) {
    player.yt = new YT.Player("ytFrame", {
      videoId: videoId,
      playerVars: {
        autoplay: 1, controls: 1, rel: 0, modestbranding: 1,
        playsinline: 1, iv_load_policy: 3, disablekb: 1
      },
      events: {
        onReady: function (ev) {
          player.ready = true;
          try { ev.target.setVolume(100); } catch (e) { }
          var pending = player.pendingVideo;
          player.pendingVideo = null;
          if (pending && pending !== videoId) {
            ev.target.loadVideoById(pending);
          } else {
            ev.target.playVideo();
          }
          setPlayIcon(true);
          startTimer();
        },
        onStateChange: onYtState,
        onError: onYtError
      }
    });
  }

  function startSong(s, v) {
    player.currentSong = s;
    player.currentVideo = v;
    updateBar();
    updateMediaSession();
    showBar();
    maybeMobileBgHint();
    refreshDrawer();
    ensureYT(function () {
      if (!player.yt) {
        createYt(v.id);
      } else if (player.ready) {
        player.yt.loadVideoById(v.id);
        setPlayIcon(true);
        startTimer();
      } else {
        player.pendingVideo = v.id;
      }
    });
  }

  function onYtState(ev) {
    if (ev.data === 0) { setTimeout(next, 120); return; }
    if (ev.data === 1) { player.playing = true; setPlayIcon(true); startTimer(); updateProgress(); updateMediaSession(); updateMediaPosition(); }
    else if (ev.data === 2) { player.playing = false; setPlayIcon(false); stopTimer(); updateProgress(); updateMediaSession(); }
  }

  function onYtError(ev) {
    if (player.currentVideo) player.blocked[player.currentVideo.id] = 1;
    var code = ev.data;
    toast(code === 101 || code === 150 ? "This video can’t be embedded — skipping." : "Video unavailable — skipping.");
    setTimeout(next, 200);
  }

  function playQueue(ids, label, startAt) {
    var list = ids.filter(function (i) { var s = state.songs[i]; return s && hasVideo(s); });
    if (!list.length) { toast("No YouTube videos are available for this selection yet."); return; }
    player.queue = list;
    player.order = list.map(function (_, i) { return i; });
    player.shuffle = false;
    updateShuffleUI();
    player.label = label || "";
    player.pos = 0;
    if (startAt != null) {
      var q = list.indexOf(startAt);
      if (q >= 0) player.pos = q;
    }
    var s = state.songs[list[player.order[player.pos]]];
    startSong(s, videoOf(s));
    openQueueForPlay();
  }

  function shuffleQueue(ids, label) {
    var list = ids.filter(function (i) { var s = state.songs[i]; return s && hasVideo(s); });
    if (!list.length) { toast("No YouTube videos are available for this selection yet."); return; }
    player.queue = list;
    player.order = shuffled(list.map(function (_, i) { return i; }));
    player.shuffle = true;
    updateShuffleUI();
    player.label = label || "";
    player.pos = 0;
    var s = state.songs[list[player.order[0]]];
    startSong(s, videoOf(s));
    openQueueForPlay();
  }

  function toggleShuffle() {
    if (!player.order.length) return;
    player.shuffle = !player.shuffle;
    var curQi = player.pos >= 0 ? player.order[player.pos] : -1;
    if (player.shuffle) {
      var rest = player.order.slice(player.pos + 1);
      shuffled(rest);
      player.order = player.order.slice(0, player.pos + 1).concat(rest);
    } else {
      player.order = player.queue.map(function (_, i) { return i; });
      player.pos = curQi >= 0 ? player.order.indexOf(curQi) : 0;
    }
    updateShuffleUI();
    if (player.listOpen) scrollQueueToCurrent();
    toast(player.shuffle ? "Shuffle on" : "Shuffle off");
  }

  function togglePlay() {
    if (player.pos >= player.order.length) { player.pos = -1; next(); return; }
    if (!player.yt) {
      if (player.currentSong) startSong(player.currentSong, player.currentVideo);
      return;
    }
    var st = player.yt.getPlayerState ? player.yt.getPlayerState() : -1;
    if (st === 1) player.yt.pauseVideo(); else player.yt.playVideo();
  }

  function next() {
    if (!player.order.length) return;
    var n = player.order.length;
    for (var k = 0; k < n; k++) {
      var p = player.pos + 1;
      if (p >= n) { endQueue(); return; }
      player.pos = p;
      var q = player.order[p];
      var s = state.songs[player.queue[q]];
      var v = videoOf(s);
      if (v && !player.blocked[v.id]) { startSong(s, v); return; }
    }
    endQueue();
  }

  function prev() {
    if (!player.order.length) return;
    if (player.pos <= 0) {
      if (player.yt && player.yt.seekTo) player.yt.seekTo(0, true);
      return;
    }
    for (var k = 0; k < player.order.length; k++) {
      var p = player.pos - 1;
      if (p < 0) return;
      player.pos = p;
      var q = player.order[p];
      var s = state.songs[player.queue[q]];
      var v = videoOf(s);
      if (v && !player.blocked[v.id]) { startSong(s, v); return; }
    }
  }

  function endQueue() {
    stopTimer();
    player.playing = false;
    setPlayIcon(false);
    updateMediaSession();
    player.pos = player.order.length;
    el("pbCur").textContent = "0:00";
    el("pbSeek").value = 0;
    if (player.listOpen) renderQueue();
  }

  function closePlayer() {
    stopTimer();
    if (player.yt && player.yt.stopVideo) player.yt.stopVideo();
    player.queue = [];
    player.order = [];
    player.pos = -1;
    player.currentSong = null;
    player.currentVideo = null;
    player.playing = false;
    updateMediaSession();
    player.label = "";
    var bar = el("playerBar");
    if (bar) bar.hidden = true;
    document.body.classList.remove("hasplayer");
    if (player.listOpen) {
      player.listOpen = false;
      var q = el("pbQueue");
      if (q) q.hidden = true;
      document.body.classList.remove("queueopen");
      var lb = el("pbList");
      if (lb) { lb.classList.remove("on"); lb.setAttribute("aria-expanded", "false"); }
    }
    layoutPlayer();
  }

  function wirePlayer() {
    if (!el("playerBar")) return;
    el("pbPlay").addEventListener("click", togglePlay);
    el("pbNext").addEventListener("click", next);
    el("pbPrev").addEventListener("click", prev);
    el("pbShuffle").addEventListener("click", toggleShuffle);
    el("pbList").addEventListener("click", function () { toggleQueue(); });
    el("pbQMin").addEventListener("click", function () { toggleQueue(false); });
    var tabNow = el("pbTabNow"), tabList = el("pbTabList");
    if (tabNow) tabNow.addEventListener("click", function () { setDrawerTab("now"); });
    if (tabList) tabList.addEventListener("click", function () { setDrawerTab("list"); });
    var info = el("pbInfo");
    if (info) info.addEventListener("click", openNow);
    var nowEl = el("pbQNow");
    if (nowEl) {
      nowEl.addEventListener("click", function (ev) {
        var row = ev.target && ev.target.closest ? ev.target.closest(".pbnowsong") : null;
        if (!row) return;
        var g = player.nowGroups[parseInt(row.getAttribute("data-g"), 10)];
        if (!g) return;
        playQueue(g.ids, g.label, parseInt(row.getAttribute("data-i"), 10));
      });
    }
    var qlist = el("pbQList");
    if (qlist) {
      qlist.addEventListener("scroll", function () {
        if (qFrame) return;
        qFrame = requestAnimationFrame(function () { qFrame = 0; renderQueue(); });
      });
      qlist.addEventListener("click", function (ev) {
        var row = ev.target && ev.target.closest ? ev.target.closest(".pbqrow") : null;
        if (row) playAt(parseInt(row.getAttribute("data-q"), 10));
      });
    }
    el("pbClose").addEventListener("click", closePlayer);
    var pipBtn = el("pbPip");
    if (pipBtn) {
      if (window.documentPictureInPicture) {
        pipBtn.addEventListener("click", openPipWindow);
      } else {
        pipBtn.style.display = "none";
      }
    }
    var ytBtn = el("pbYt");
    if (ytBtn) {
      ytBtn.addEventListener("click", function () {
        var s = player.currentSong;
        var v = player.currentVideo;
        var url;
        if (v && v.id) {
          url = "https://www.youtube.com/watch?v=" + encodeURIComponent(v.id);
        } else if (s) {
          url = "https://www.youtube.com/results?search_query=" +
            encodeURIComponent((s.title || s.titleMl) + " " + ((s.movie && (s.movie.title || s.movie.titleMl)) || "") + " Malayalam song");
        } else {
          toast("Play a song first.");
          return;
        }
        window.open(url, "_blank", "noopener");
      });
    }
    el("pbVid").addEventListener("click", function () {
      var v = el("pbVideo");
      v.classList.toggle("hidden");
      if (v.classList.contains("hidden")) {
        toast("Video off — the song keeps playing. Use the notification media controls when you switch apps.");
      }
      layoutPlayer();
    });
    var seek = el("pbSeek");
    seek.addEventListener("input", function () { player.dragging = true; });
    seek.addEventListener("change", function () {
      player.dragging = false;
      if (player.yt && player.yt.getDuration) {
        var d = player.yt.getDuration() || 0;
        player.yt.seekTo(d * (parseInt(seek.value, 10) / 1000), true);
      }
    });
    window.addEventListener("resize", function () {
      layoutPlayer();
      if (player.listOpen && player.tab === "list") renderQueue();
    });
    layoutPlayer();
  }
  wirePlayer();

  /* ---------------- routing ---------------- */
  /* ---------------- admin: sign-in and catalogue editing ---------------- */
  var AUTH = {
    user: "georamesh",
    salt: "fcXgSIEcdX+XnQu3lJV/OQ==",
    iter: 310000,
    hash: "A2rgjpFgwN5mocgCJcAA5mR8cmImHjKdGjV9LWi/Gic=",
    session: "msi.admin.v1",
    tries: "msi.admin.tries",
    lock: "msi.admin.lock",
    hours: 8
  };

  function sameBytes(a, b) {
    if (a.length !== b.length) return false;
    var d = 0;
    for (var i = 0; i < a.length; i++) d |= a[i] ^ b[i];
    return d === 0;
  }

  function isAdmin() {
    try {
      var s = JSON.parse(sessionStorage.getItem(AUTH.session) || "null");
      return !!(s && s.u === AUTH.user && s.exp > Date.now());
    } catch (e) { return false; }
  }

  function lockLeft() {
    var t = parseInt(sessionStorage.getItem(AUTH.lock) || "0", 10) || 0;
    return Math.max(0, t - Date.now());
  }

  function mlNames(people) {
    return people.map(function (p) { return p.ml; }).join(", ");
  }

  function renderLogin() {
    layout(
      '<div class="admwrap admnarrow">' +
        '<div class="pagehead"><div class="kicker">Admin</div><h1>Sign in</h1>' +
        '<div class="sub">Editing is limited to the site owner.</div></div>' +
        '<div class="card admcard">' +
          '<form id="loginForm" class="admform" autocomplete="off">' +
            '<label class="admfield">Username<input id="admUser" name="username" autocapitalize="none" spellcheck="false" autocomplete="username"></label>' +
            '<label class="admfield">Password<input id="admPass" name="password" type="password" autocomplete="current-password"></label>' +
            '<div class="actions"><button class="btn primary" type="submit" id="admGo">Sign in</button>' +
            '<span class="adminmsg" id="loginMsg" role="status"></span></div>' +
          '</form>' +
        '</div>' +
        '<p class="mut admnote">The password is checked in your browser against a salted PBKDF2 hash — it is never stored on the server. ' +
        'Five wrong attempts lock sign-in for 30 seconds.</p>' +
      "</div>");
    el("loginForm").addEventListener("submit", function (ev) { ev.preventDefault(); tryLogin(); });
    var u = el("admUser");
    if (u) u.focus();
  }

  function tryLogin() {
    var user = (el("admUser").value || "").trim();
    var pass = el("admPass").value || "";
    var msg = el("loginMsg"), btn = el("admGo");
    var left = lockLeft();
    if (left > 0) { msg.textContent = "Too many attempts. Try again in " + Math.ceil(left / 1000) + "s."; return; }
    if (!user || !pass) { msg.textContent = "Enter your username and password."; return; }
    if (!window.crypto || !window.crypto.subtle) { msg.textContent = "This browser cannot sign in (Web Crypto unavailable)."; return; }

    btn.disabled = true; btn.textContent = "Checking…"; msg.textContent = "";
    var enc = new TextEncoder().encode(pass);
    crypto.subtle.importKey("raw", enc, "PBKDF2", false, ["deriveBits"]).then(function (k) {
      return crypto.subtle.deriveBits(
        { name: "PBKDF2", salt: b64Bytes(AUTH.salt), iterations: AUTH.iter, hash: "SHA-256" }, k, 256);
    }).then(function (bits) {
      var okUser = user.toLowerCase() === AUTH.user;
      var okPass = sameBytes(new Uint8Array(bits), b64Bytes(AUTH.hash));
      if (!okUser || !okPass) throw new Error("bad credentials");
      sessionStorage.setItem(AUTH.session, JSON.stringify({ u: AUTH.user, exp: Date.now() + AUTH.hours * 3600e3 }));
      sessionStorage.removeItem(AUTH.tries);
      sessionStorage.removeItem(AUTH.lock);
      el("admPass").value = "";
      toast("Signed in as " + AUTH.user);
      route();
    }).catch(function () {
      var tries = (parseInt(sessionStorage.getItem(AUTH.tries) || "0", 10) || 0) + 1;
      if (tries >= 5) {
        sessionStorage.setItem(AUTH.tries, "0");
        sessionStorage.setItem(AUTH.lock, String(Date.now() + 30000));
        msg.textContent = "Too many attempts. Locked for 30 seconds.";
      } else {
        sessionStorage.setItem(AUTH.tries, String(tries));
        msg.textContent = "Wrong username or password. " + (5 - tries) + " " + plural(5 - tries, "try", "tries") + " left.";
      }
      btn.disabled = false; btn.textContent = "Sign in";
    });
  }

  function renderAdmin(what, id) {
    if (!isAdmin()) return renderLogin();
    if (what === "song" && id) return renderSongEditor(id);
    if (what === "movie" && id) return renderMovieEditor(id);
    return renderAdminHome();
  }

  function downloadOverrides() {
    var doc = {
      v: 1,
      generated: new Date().toISOString().slice(0, 10),
      songs: state.overrides.songs,
      movies: state.overrides.movies
    };
    var blob = new Blob([JSON.stringify(doc, null, 2) + "\n"], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "overrides.json";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  function renderAdminHome() {
    var nS = Object.keys(state.overrides.songs).length;
    var nM = Object.keys(state.overrides.movies).length;
    layout(crumbs([{ label: "Admin" }]) +
      '<div class="admwrap">' +
        '<div class="pagehead"><div class="kicker">Admin</div><h1>Edit the catalogue</h1>' +
        '<div class="sub">Signed in as <b>' + esc(AUTH.user) + '</b> · <a href="#" id="admOut">Sign out</a></div></div>' +
        '<div class="card admcard"><h2>Find a song or film</h2>' +
          '<input id="admSearch" type="search" placeholder="Title in English or Malayalam…" autocomplete="off" aria-label="Find a song or film">' +
          '<div id="admResults" class="admresults"><p class="mut">Type at least two characters.</p></div>' +
        '</div>' +
        '<div class="card admcard"><h2>Saved changes</h2>' +
          '<p class="mut">' + num(nS) + ' ' + plural(nS, "song") + ' and ' + num(nM) + ' ' + plural(nM, "film") +
          ' edited on this device. Saves are kept in this browser; <b>Download</b> writes an <code>overrides.json</code> ' +
          'you can publish so everyone sees the same corrections.</p>' +
          '<div class="actions">' +
            '<button class="btn primary" id="admExport" type="button">Download overrides.json</button>' +
            '<label class="btn" for="admImport">Load overrides file…</label>' +
            '<input id="admImport" type="file" accept="application/json,.json" hidden>' +
            '<button class="btn" id="admClear" type="button">Discard local changes</button>' +
          '</div>' +
        '</div>' +
        '<div class="card admcard"><h2>Comments</h2>' +
          "<p class=\"mut\">" + (commentsConfig()
            ? "Comments are live on song and film pages. The themed form there posts through your Google Form into its " +
              "linked sheet; delete a row (or clear its comment) to remove a comment from the site."
            : "Not set up yet. Create the Google Form, link it to a Sheet and deploy the reader described in " +
              "<code>comments/SETUP.md</code>, then fill in <code>assets/comments-config.js</code>.") + "</p>" +
        "</div>" +
        '<div class="card admcard"><h2>How the data is protected</h2>' +
          '<p class="mut">The catalogue is shipped as compressed, AES-encrypted binary files with an integrity tag, ' +
          'not as readable JSON, so the raw data cannot simply be downloaded and re-used. Anything a browser can display ' +
          'can still be captured by determined people; this deters casual copying.</p>' +
        '</div>' +
      '</div>');

    el("admOut").addEventListener("click", function (ev) {
      ev.preventDefault();
      sessionStorage.removeItem(AUTH.session);
      toast("Signed out");
      route();
    });
    el("admExport").addEventListener("click", downloadOverrides);
    el("admClear").addEventListener("click", function () {
      if (!confirm("Discard every local edit? Published overrides.json (if present) will still load.")) return;
      localStorage.removeItem(OVR_KEY);
      location.reload();
    });
    el("admImport").addEventListener("change", function () {
      var file = this.files && this.files[0];
      if (!file) return;
      var fr = new FileReader();
      fr.onload = function () {
        try {
          var doc = JSON.parse(String(fr.result));
          if (!doc || (!doc.songs && !doc.movies)) throw new Error("not an overrides file");
          var ov = emptyOverrides();
          copyKind(doc.songs, ov.songs);
          copyKind(doc.movies, ov.movies);
          state.overrides = ov;
          saveOverrides();
          toast("Overrides loaded");
          location.reload();
        } catch (e) {
          toast("That file is not a valid overrides.json");
        }
      };
      fr.readAsText(file);
    });

    var timer = null;
    el("admSearch").addEventListener("input", function () {
      clearTimeout(timer);
      var q = this.value.trim();
      timer = setTimeout(function () { adminResults(q); }, 140);
    });
    el("admSearch").focus();
  }

  function adminResults(q) {
    var box = el("admResults");
    if (!box) return;
    if (q.length < 2) { box.innerHTML = '<p class="mut">Type at least two characters.</p>'; return; }
    var lq = q.toLowerCase();
    var songs = [], movies = [], i;
    for (i = 0; i < state.songs.length && songs.length < 12; i++) {
      if (state.songs[i].hay.indexOf(lq) >= 0) songs.push(state.songs[i]);
    }
    var allMovies = [];
    state.movies.forEach(function (m) { allMovies.push(m); });
    for (i = 0; i < allMovies.length && movies.length < 8; i++) {
      if (allMovies[i].songIds.length && allMovies[i].hay.indexOf(lq) >= 0) movies.push(allMovies[i]);
    }
    function songRow(s) {
      var film = s.movie ? (s.movie.title || s.movie.titleMl) : "";
      return '<a class="admres" href="' + hashFor(["admin", "song", s.id]) + '">' +
        '<span class="tag">Song</span><span class="rmain"><b>' + esc(s.title || s.titleMl) + "</b>" +
        (s.titleMl && s.title ? ' <span lang="ml" class="rml">' + esc(s.titleMl) + "</span>" : "") +
        '<small>' + esc(film) + (s.year ? " · " + s.year : "") + "</small></span></a>";
    }
    function movieRow(m) {
      return '<a class="admres" href="' + hashFor(["admin", "movie", m.id]) + '">' +
        '<span class="tag film">Film</span><span class="rmain"><b>' + esc(m.title || m.titleMl) + "</b>" +
        (m.titleMl && m.title ? ' <span lang="ml" class="rml">' + esc(m.titleMl) + "</span>" : "") +
        "<small>" + (m.year || "—") + " · " + num(m.songIds.length) + " " + plural(m.songIds.length, "song") + "</small></span></a>";
    }
    var html = songs.map(songRow).join("") + movies.map(movieRow).join("");
    box.innerHTML = html || '<p class="mut">Nothing matched.</p>';
  }

  function admField(label, name, value, attrs) {
    return '<label class="admfield">' + esc(label) +
      '<input name="' + name + '" value="' + esc(value == null ? "" : value) + '"' + (attrs || "") + "></label>";
  }

  function admPair(label, enName, enValue, mlName, mlValue) {
    return '<div class="admpair"><div class="admpairhead">' + esc(label) + "</div>" +
      '<label class="admfield">English<input name="' + enName + '" value="' + esc(enValue) + '"></label>' +
      '<label class="admfield">Malayalam<input name="' + mlName + '" value="' + esc(mlValue) + '" lang="ml"></label></div>';
  }

  function renderSongEditor(id) {
    var s = state.byId.get(String(id));
    if (!s) { notFound("song"); return; }
    var has = !!(state.overrides.songs[s.id] && Object.keys(state.overrides.songs[s.id]).length);
    var vid = (state.videos.get(s.id) || {}).id || "";

    layout(crumbs([{ label: "Admin", href: "#/admin" }, { label: "Song" }]) +
      '<div class="admwrap admnarrow">' +
        '<div class="pagehead"><div class="kicker">Admin · song ' + esc(s.id) + '</div>' +
        '<h1>' + esc(s.title || s.titleMl) + '</h1>' +
        '<div class="sub"><a href="' + hashFor(["song", s.id]) + '">View the public page</a></div></div>' +
        '<div class="card admcard"><form id="editForm" class="admform">' +
          admField("Title (English)", "title", s.title) +
          admField("Title (Malayalam)", "titleMl", s.titleMl, ' lang="ml"') +
          '<div class="admpair"><div class="admpairhead">Release</div>' +
            '<label class="admfield">Year<input name="year" type="number" min="0" max="2100" value="' + (s.year || "") + '"></label>' +
            '<label class="admfield">Film<input value="' + esc(s.movie ? (s.movie.title || s.movie.titleMl) : "") + '" disabled></label>' +
          "</div>" +
          admPair("Singers", "singers", namesOf(s.singers), "singersMl", mlNames(s.singers)) +
          admPair("Lyricist", "lyricist", namesOf(s.lyricist), "lyricistMl", mlNames(s.lyricist)) +
          admPair("Music", "music", namesOf(s.music), "musicMl", mlNames(s.music)) +
          admField("YouTube video ID", "videoId", vid, ' maxlength="11" spellcheck="false" autocomplete="off"') +
          '<p class="mut admhint">The 11-character code after <code>watch?v=</code>. Leave it empty to mark the song as unplayable.</p>' +
          '<div class="actions"><button class="btn primary" type="submit">Save</button>' +
            '<a class="btn" href="#/admin">Cancel</a>' +
            (has ? '<button class="btn" type="button" id="admRevert">Revert this song</button>' : "") +
          "</div>" +
        "</form></div>" +
      "</div>");

    el("editForm").addEventListener("submit", function (ev) { ev.preventDefault(); saveSongEdit(s); });
    if (has) el("admRevert").addEventListener("click", function () { revertOverride("songs", s.id); });
  }

  function saveSongEdit(s) {
    var f = el("editForm"), e = f.elements;
    var patch = {};
    function cmp(key, v, cur) { if (v !== String(cur == null ? "" : cur)) patch[key] = v; }

    cmp("title", e.title.value.trim(), s.title);
    cmp("titleMl", e.titleMl.value.trim(), s.titleMl);
    var year = parseInt(e.year.value, 10);
    if (isNaN(year) || year < 0) year = 0;
    if (year !== (s.year || 0)) patch.year = year;

    if (e.singers.value.trim() !== namesOf(s.singers) || e.singersMl.value.trim() !== mlNames(s.singers)) {
      patch.singers = e.singers.value.trim();
      patch.singersMl = e.singersMl.value.trim();
    }
    if (e.lyricist.value.trim() !== namesOf(s.lyricist) || e.lyricistMl.value.trim() !== mlNames(s.lyricist)) {
      patch.lyricist = e.lyricist.value.trim();
      patch.lyricistMl = e.lyricistMl.value.trim();
    }
    if (e.music.value.trim() !== namesOf(s.music) || e.musicMl.value.trim() !== mlNames(s.music)) {
      patch.music = e.music.value.trim();
      patch.musicMl = e.musicMl.value.trim();
    }
    var vid = e.videoId.value.trim();
    if (vid && !/^[A-Za-z0-9_-]{11}$/.test(vid)) { toast("A YouTube video ID is 11 characters."); return; }
    if (vid !== ((state.videos.get(s.id) || {}).id || "")) patch.videoId = vid;

    if (!Object.keys(patch).length) { toast("No changes to save."); return; }
    state.overrides.songs[s.id] = state.overrides.songs[s.id] || {};
    Object.keys(patch).forEach(function (k) { state.overrides.songs[s.id][k] = patch[k]; });
    saveOverrides();
    applyOverrides();
    buildIndexes();
    refreshDrawer();
    toast("Saved on this device — download overrides.json to publish.");
    route();
  }

  function renderMovieEditor(id) {
    var m = state.movies.get(String(id));
    if (!m) { notFound("movie"); return; }
    var has = !!(state.overrides.movies[m.id] && Object.keys(state.overrides.movies[m.id]).length);

    layout(crumbs([{ label: "Admin", href: "#/admin" }, { label: "Film" }]) +
      '<div class="admwrap admnarrow">' +
        '<div class="pagehead"><div class="kicker">Admin · film ' + esc(m.id) + '</div>' +
        '<h1>' + esc(m.title || m.titleMl) + '</h1>' +
        '<div class="sub"><a href="' + hashFor(["movie", m.id]) + '">View the public page</a></div></div>' +
        '<div class="card admcard"><form id="editForm" class="admform">' +
          admField("Title (English)", "title", m.title) +
          admField("Title (Malayalam)", "titleMl", m.titleMl, ' lang="ml"') +
          admField("Year", "year", m.year || "", ' type="number" min="0" max="2100"') +
          admPair("Director", "director", namesOf(m.director), "directorMl", mlNames(m.director)) +
          admPair("Music", "music", namesOf(m.music), "musicMl", mlNames(m.music)) +
          admPair("Lyricist", "lyricist", namesOf(m.lyricist), "lyricistMl", mlNames(m.lyricist)) +
          '<p class="mut admhint">Correcting the year here also updates every song in the film.</p>' +
          '<div class="actions"><button class="btn primary" type="submit">Save</button>' +
            '<a class="btn" href="#/admin">Cancel</a>' +
            (has ? '<button class="btn" type="button" id="admRevert">Revert this film</button>' : "") +
          "</div>" +
        "</form></div>" +
      "</div>");

    el("editForm").addEventListener("submit", function (ev) { ev.preventDefault(); saveMovieEdit(m); });
    if (has) el("admRevert").addEventListener("click", function () { revertOverride("movies", m.id); });
  }

  function saveMovieEdit(m) {
    var f = el("editForm"), e = f.elements;
    var patch = {};
    function cmp(key, v, cur) { if (v !== String(cur == null ? "" : cur)) patch[key] = v; }

    cmp("title", e.title.value.trim(), m.title);
    cmp("titleMl", e.titleMl.value.trim(), m.titleMl);
    var year = parseInt(e.year.value, 10);
    if (isNaN(year) || year < 0) year = 0;
    if (year !== (m.year || 0)) patch.year = year;

    if (e.director.value.trim() !== namesOf(m.director) || e.directorMl.value.trim() !== mlNames(m.director)) {
      patch.director = e.director.value.trim();
      patch.directorMl = e.directorMl.value.trim();
    }
    if (e.music.value.trim() !== namesOf(m.music) || e.musicMl.value.trim() !== mlNames(m.music)) {
      patch.music = e.music.value.trim();
      patch.musicMl = e.musicMl.value.trim();
    }
    if (e.lyricist.value.trim() !== namesOf(m.lyricist) || e.lyricistMl.value.trim() !== mlNames(m.lyricist)) {
      patch.lyricist = e.lyricist.value.trim();
      patch.lyricistMl = e.lyricistMl.value.trim();
    }

    if (!Object.keys(patch).length) { toast("No changes to save."); return; }
    state.overrides.movies[m.id] = state.overrides.movies[m.id] || {};
    Object.keys(patch).forEach(function (k) { state.overrides.movies[m.id][k] = patch[k]; });
    saveOverrides();
    applyOverrides();
    buildIndexes();
    refreshDrawer();
    toast("Saved on this device — download overrides.json to publish.");
    route();
  }

  function revertOverride(kind, id) {
    if (!confirm("Revert this entry to the original data? Your local edits for it will be removed.")) return;
    delete state.overrides[kind][id];
    saveOverrides();
    // reload so the original rows are rebuilt exactly as they were
    location.reload();
  }

  function parseHash() {
    var h = location.hash.replace(/^#\/?/, "");
    if (!h) return [];
    try {
      return h.split("/").map(decodeURIComponent);
    } catch (e) {
      return [];
    }
  }

  function setActiveNav(section) {
    Array.prototype.forEach.call(document.querySelectorAll(".topnav a"), function (a) {
      a.classList.toggle("active", a.getAttribute("href") === "#/" + section);
    });
  }

  function route() {
    if (!state.ready) return;
    var p = parseHash();
    var section = p[0] || "";
    setActiveNav(NAV_FOR[section] != null ? NAV_FOR[section] : section);

    if (!section) return renderHome();
    if (section === "admin") return renderAdmin(p[1], p[2]);
    if (section === "years") return renderYears();
    if (section === "year" && p[1]) return renderYear(p[1]);
    if (section === "movies") return renderMovies();
    if (section === "movie" && p[1]) return renderMovie(p[1]);
    if (section === "song" && p[1]) return renderSong(p[1]);
    if (section === "ragams") return renderRagams();
    if (section === "ragam" && p[1]) return renderRagamSongs(p[1]);
    if (KINDS[section] && !p[1]) return renderEntityIndex(section);
    if (p[1] && ROUTE_KIND[section]) return renderEntitySongs(ROUTE_KIND[section], p[1]);
    renderHome();
  }

  window.addEventListener("hashchange", route);

  /* ---------------- search box ---------------- */
  var searchEl = el("globalSearch");
  searchEl.addEventListener("input", function () {
    clearTimeout(state.searchTimer);
    var q = searchEl.value.trim();
    state.searchTimer = setTimeout(function () {
      if (q.length < 2) return;
      renderSearch(q);
      setActiveNav("");
    }, 180);
  });
  searchEl.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape") { searchEl.value = ""; route(); searchEl.blur(); }
  });

  var brandEl = document.querySelector(".brand");
  if (brandEl) {
    brandEl.addEventListener("click", function () {
      searchEl.value = "";
      var h = location.hash;
      if (!h || h === "#" || h === "#/") route();
    });
  }
  document.addEventListener("keydown", function (ev) {
    var tag = (ev.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea") return;
    if (ev.key === "/") { ev.preventDefault(); searchEl.focus(); }
  });

  /* ---------------- boot ---------------- */
  function syncTopbarHeight() {
    var bar = document.querySelector(".topbar");
    if (bar) document.documentElement.style.setProperty("--topbarh", bar.offsetHeight + "px");
  }
  window.addEventListener("resize", syncTopbarHeight);
  syncTopbarHeight();

  loadData().then(function () {
    syncTopbarHeight();
    route();
  }).catch(function (err) {
    view.innerHTML =
      '<div class="boot"><div class="boot-inner"><h1>Could not load the song data</h1>' +
      '<p>' + esc(err.message) + "</p>" +
      '<p class="mut">Make sure <code>data/songs.dat</code>, <code>data/movies.dat</code> and <code>data/videos.dat</code> sit next to <code>index.html</code>, ' +
      "then reload. If you opened this file directly from disk, use a local server instead.</p></div></div>";
  });
})();
