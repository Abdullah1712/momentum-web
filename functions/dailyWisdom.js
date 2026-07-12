// functions/dailyWisdom.js
//
// Wechselt automatisch alle 6 Stunden zwischen einem Koranvers und einem Hadith
// (nur Bukhari & Muslim, da als "sahih"/authentisch geltende Hauptsammlungen).
// Beide Inhalte kommen aus echten, öffentlichen Quellen — kein Scraping, kein
// von mir "erinnerter" Text. Es wird bewusst eine Liste sehr bekannter
// Verse/Hadithe ausgeschlossen, damit eher unbekannte Inhalte erscheinen.
//
// Übersetzungs-Reihenfolge: Deutsch → Englisch → nur Arabisch (falls beides fehlschlägt)

// Cloudflare Pages nutzt "onRequest" anstelle von "exports.handler"
export async function onRequest(context) {
  const { request } = context;

  // CORS-Header für Cloudflare vorbereiten
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": "application/json"
  };

  // Vorabcheck für OPTIONS-Anfragen (CORS Preflight)
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 200, headers });
  }

  const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
  const slot = Math.floor(Date.now() / SIX_HOURS_MS);

  // Seeded PRNG (mulberry32) — gleicher Slot => immer dasselbe Ergebnis
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rand = mulberry32(slot);
  const type = slot % 2 === 0 ? "quran" : "hadith"; // garantierter Wechsel jeden Zyklus

  // Sehr bekannte Verse, die wir bewusst NICHT anzeigen wollen
  const FAMOUS_AYAHS = new Set([
    "2:255", "2:286", "94:5", "94:6",
    "112:1", "112:2", "112:3", "112:4",
    "1:1", "1:2", "1:3", "1:4", "1:5", "1:6", "1:7",
    "24:35", "13:28"
  ]);

  // Sehr bekannte Hadithe (Sammlung:Nummer), die wir ausschließen
  const FAMOUS_HADITH = new Set([
    "bukhari:1", "muslim:1", "bukhari:6021", "muslim:2564"
  ]);

  const FALLBACK = {
    type: "hadith",
    ar: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ",
    text: "Taten werden nur nach den Absichten bewertet, und jedem Menschen wird nur das zuteil, was er beabsichtigt hat.",
    ref: "Sahih al-Bukhari 1"
  };

  try {
    const result = type === "quran" ? await pickQuranVerse(rand) : await pickHadith(rand);
    // Cloudflare gibt Daten als echtes "Response"-Objekt zurück
    return new Response(JSON.stringify({ success: true, slot, ...result }), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, slot, ...FALLBACK, error: error.message }), { status: 200, headers });
  }

  // ---------------- Koran ----------------
  async function pickQuranVerse(rand) {
    const surahRes = await fetch("https://api.alquran.cloud/v1/surah");
    const surahData = await surahRes.json();
    const surahs = surahData.data;

    let ref, attempts = 0;
    do {
      const s = surahs[Math.floor(rand() * surahs.length)];
      const ayahNum = 1 + Math.floor(rand() * s.numberOfAyahs);
      ref = `${s.number}:${ayahNum}`;
      attempts++;
    } while (FAMOUS_AYAHS.has(ref) && attempts < 20);

    let arabicText, translation, translationLang;
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/ayah/${ref}/editions/quran-uthmani,de.bubenheim`);
      const data = await res.json();
      arabicText = data.data[0].text;
      translation = data.data[1].text;
      translationLang = "de";
    } catch (e) {
      try {
        const res = await fetch(`https://api.alquran.cloud/v1/ayah/${ref}/editions/quran-uthmani,en.sahih`);
        const data = await res.json();
        arabicText = data.data[0].text;
        translation = data.data[1].text;
        translationLang = "en";
      } catch (e2) {
        const res = await fetch(`https://api.alquran.cloud/v1/ayah/${ref}/quran-uthmani`);
        const data = await res.json();
        arabicText = data.data.text;
        translation = null;
        translationLang = null;
      }
    }

    const surahRes2 = surahs.find(s => `${s.number}` === ref.split(":")[0]);

    return {
      type: "quran",
      ar: arabicText,
      text: translation,
      lang: translationLang,
      ref: `Quran ${surahRes2.englishName} (${ref})`
    };
  }

  // ---------------- Hadith (nur Bukhari & Muslim) ----------------
  async function pickHadith(rand) {
    const BOOKS = [
      { id: "bukhari", ar: "ara-bukhari", en: "eng-bukhari" },
      { id: "muslim", ar: "ara-muslim", en: "eng-muslim" }
    ];
    const book = BOOKS[Math.floor(rand() * BOOKS.length)];

    const infoRes = await fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${book.en}/info.min.json`);
    const info = await infoRes.json();
    const total = info.metadata.length;

    let number, key, attempts = 0;
    do {
      number = 1 + Math.floor(rand() * total);
      key = `${book.id}:${number}`;
      attempts++;
    } while (FAMOUS_HADITH.has(key) && attempts < 20);

    const arabicRes = await fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${book.ar}/${number}.min.json`);
    const arabicData = await arabicRes.json();
    const arabicText = arabicData.hadiths[0].text;

    let translation = null, translationLang = null;
    try {
      const enRes = await fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${book.en}/${number}.min.json`);
      const enData = await enRes.json();
      translation = enData.hadiths[0].text;
      translationLang = "en";
    } catch (e) {
      translation = null;
      translationLang = null;
    }

    return {
      type: "hadith",
      ar: arabicText,
      text: translation,
      lang: translationLang,
      ref: `${book.id === "bukhari" ? "Sahih al-Bukhari" : "Sahih Muslim"} ${number}`
    };
  }
}
