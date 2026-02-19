// Stub window.gtag until the real Google Analytics script loads.
//
// The @docusaurus/plugin-google-gtag client module calls window.gtag()
// on every client-side navigation. In dev mode (and occasionally in
// production on slow connections), the external gtag.js script hasn't
// loaded yet, causing "window.gtag is not a function" errors.
//
// This no-op stub absorbs those calls silently. Once the real gtag.js
// loads, it overwrites window.gtag with the real implementation and
// replays anything queued via window.dataLayer.

if (typeof window !== 'undefined' && typeof window.gtag !== 'function') {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
}
