// Download links of the website (Vega Lite only, app/edition.py; the full Vega isn't offered publicly): the ONLY place to change when a new version is released.
// The site reads this on every page (download buttons, sizes, version). Point the URLs at the GitHub release assets;
// "latest/download/<file>" always serves the newest release that carries a file with exactly that name.
window.VEGA_DOWNLOADS = {
  version: "0.1.0",
  released: "2026-11",                                   // shown as "Version 0.1.0 · November 2026"
  repo: "https://github.com/shum-panda/vega-lite",
  releases: "https://github.com/shum-panda/vega-lite/releases",
  issues: "https://github.com/shum-panda/vega-lite/issues",
  files: {
    // Vega Lite (app/edition.py): One Piece only, only data its providers make available to everyone
    "lite-windows": {
      label: "Windows",
      file: "VegaLite-windows.zip",                      // packaging/release.py --lite
      url: "https://github.com/shum-panda/vega-lite/releases/latest/download/VegaLite-windows.zip",
      size: "24 MB",
      needs: "Windows 10 or 11, 64-bit, with Microsoft Edge (built in) or Google Chrome",
    },
    "lite-android": {
      label: "Android",
      file: "VegaLite-android.apk",                      // packaging/release.py --lite
      url: "https://github.com/shum-panda/vega-lite/releases/latest/download/VegaLite-android.apk",
      size: "57 MB",
      needs: "Android 7.0 or newer",
    },
  },
};
