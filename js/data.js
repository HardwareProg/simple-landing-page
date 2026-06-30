// Inlined as plain JS (instead of fetched JSON) so the page also works when
// opened directly from disk (file://), where fetch() of local files is blocked.

// Default NASA FIRMS MAP_KEY so visitors see live hotspots with no setup.
// This key is public (visible in page source / git history) and shared by
// every visitor against its 5,000-transactions/10-min account limit.
// Visitors can still override it with their own key via the UI field.
window.FIRMS_DEFAULT_MAP_KEY = 'a3a81b48a614a8637ca835890a1bfb80';

window.NOC_FACILITIES_DATA = {
  "_meta": {
    "description": "Indicative locations of major National Oil Corporation (NOC) of Libya subsidiaries, fields and terminals associated with flaring risk. Coordinates are approximate facility/field centroids compiled from public geological and industry references (Wikipedia, Global Energy Monitor, USGS Sirte Basin studies, AGOCO/NOC public materials) and are intended for general orientation only — they are NOT derived from satellite flare detections and should be verified against primary sources before use in formal analysis.",
    "lastReviewed": "2026-06-30"
  },
  "facilities": [
    { "name": "Sarir Field", "subsidiary": "Arabian Gulf Oil Company (AGOCO)", "type": "Field", "lat": 28.2200, "lng": 19.1300, "note": "Libya's largest oil field, discovered 1961" },
    { "name": "Messla Field", "subsidiary": "Arabian Gulf Oil Company (AGOCO)", "type": "Field", "lat": 29.0000, "lng": 21.5000 },
    { "name": "Nafoora Field", "subsidiary": "Arabian Gulf Oil Company (AGOCO)", "type": "Field", "lat": 29.1800, "lng": 21.8300 },
    { "name": "Amal Field", "subsidiary": "Harouge Oil Operations", "type": "Field", "lat": 29.2500, "lng": 21.0500 },
    { "name": "Defa / Waha Concessions", "subsidiary": "Waha Oil Company", "type": "Field", "lat": 28.7400, "lng": 21.4400, "note": "JV: NOC, ConocoPhillips, Marathon, Hess" },
    { "name": "Brega Complex", "subsidiary": "Sirte Oil Company", "type": "Terminal / Petrochemical", "lat": 30.4100, "lng": 19.5800 },
    { "name": "Zueitina Terminal", "subsidiary": "Zueitina Oil Company", "type": "Terminal", "lat": 30.9500, "lng": 20.1800 },
    { "name": "Ras Lanuf Terminal & Refinery", "subsidiary": "Ras Lanuf Oil & Gas Processing Co.", "type": "Terminal / Refinery", "lat": 30.5100, "lng": 18.5500 },
    { "name": "Es Sider Terminal", "subsidiary": "Waha Oil Company", "type": "Terminal", "lat": 30.6000, "lng": 18.3600, "note": "Libya's largest crude export terminal" },
    { "name": "Sharara Field", "subsidiary": "Akakus Oil Operations", "type": "Field", "lat": 27.3500, "lng": 10.1800, "note": "JV: NOC, Repsol, TotalEnergies, OMV" },
    { "name": "El Feel (Elephant) Field", "subsidiary": "Akakus / Mellitah Oil & Gas", "type": "Field", "lat": 28.0000, "lng": 11.1800, "note": "JV: NOC, Eni" },
    { "name": "Mellitah Complex", "subsidiary": "Mellitah Oil & Gas", "type": "Terminal / Gas Plant", "lat": 32.6600, "lng": 12.0600, "note": "JV: NOC, Eni; supplies Greenstream pipeline to Italy" },
    { "name": "Zawiya Refinery", "subsidiary": "Zawiya Oil Refining Company", "type": "Refinery", "lat": 32.7500, "lng": 12.7300 },
    { "name": "Marsa el Hariga Terminal", "subsidiary": "Arabian Gulf Oil Company (AGOCO)", "type": "Terminal", "lat": 32.0700, "lng": 23.9600 }
  ]
};

window.WORLDBANK_FLARING_DATA = {
  "_meta": {
    "description": "Libya annual gas flaring volume, billion cubic meters (bcm), as reported by the World Bank Global Gas Flaring Reduction (GGFR) / Global Flaring and Methane Reduction Partnership (GFMR) satellite-based flaring tracker. Only years with a directly verified, citable figure are included — gaps are left out rather than estimated, to avoid presenting invented numbers. Visit https://www.worldbank.org/en/programs/gasflaringreduction/global-flaring-data for the complete official dataset.",
    "unit": "bcm (billion cubic meters)",
    "lastReviewed": "2026-06-30"
  },
  "series": [
    { "year": 2012, "bcm": 5.9, "source": "World Bank GGFR Global Gas Flaring Tracker" },
    { "year": 2020, "bcm": 2.5, "source": "World Bank GGFR Global Gas Flaring Tracker" },
    { "year": 2022, "bcm": 5.4, "source": "World Bank GGFR Global Gas Flaring Tracker" },
    { "year": 2023, "bcm": 6.8, "source": "World Bank GGFR: +1.4 bcm (+25%) reported vs. 2022", "approx": true },
    { "year": 2024, "bcm": 6.3, "source": "World Bank GFMR / press reporting on Libya's ZRF accession, May 2026" }
  ],
  "milestones": [
    {
      "date": "2026-04-30",
      "label": "Libya formally joins the World Bank Zero Routine Flaring by 2030 (ZRF) Initiative",
      "detail": "Signed at World Bank HQ, Washington D.C. Estimated annual loss from flaring at time of joining: ~US$650 million/year.",
      "source": "Libya Herald / Libya Observer, May 2026"
    }
  ]
};
