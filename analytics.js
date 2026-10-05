/* Consent-gated PostHog (EU). Nothing loads or is stored until the visitor
   accepts; the choice is remembered in localStorage and can be changed from
   the "Cookie settings" link this script adds to the footer. */
(function () {
  var KEY = 'phc_rKhDbEpEXwcgUY62HjBSZBQoPA4hXaixbd9ngZtpW5Nz'; // public project key
  var STORE = 'analytics-consent';
  var loaded = false;
  // Resolved against this script, so it works from the root and from issues/.
  var PRIVACY_URL = new URL('privacy.html', document.currentScript.src).href;

  function choice() {
    try { return localStorage.getItem(STORE); } catch (e) { return null; }
  }
  function remember(value) {
    try { localStorage.setItem(STORE, value); } catch (e) {}
  }

  function load() {
    if (loaded) return;
    loaded = true;
    // Same queue shape as PostHog's official snippet: array.js reads _i on load.
    var stub = window.posthog = [];
    stub.people = [];
    stub.__SV = 1;
    stub._i = [[KEY, {
      api_host: 'https://eu.i.posthog.com',
      ui_host: 'https://eu.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: true,
      disable_session_recording: true,
      respect_dnt: true
    }, 'posthog']];
    var s = document.createElement('script');
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.src = 'https://eu-assets.i.posthog.com/static/array.js';
    document.head.appendChild(s);
  }

  var banner;
  function showBanner() {
    if (banner) { banner.hidden = false; return; }
    banner = document.createElement('div');
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.style.cssText = 'position:fixed;left:1rem;right:1rem;bottom:1rem;z-index:1000;' +
      'max-width:40rem;margin:0 auto;padding:1.1rem 1.25rem;background:var(--card-bg,#141414);' +
      'border:1px solid var(--gold-dim,#7A6128);border-radius:var(--radius,4px);' +
      "color:var(--white,#F5F2EC);font-family:'DM Sans',sans-serif;font-size:0.875rem;line-height:1.5;";
    var text = document.createElement('p');
    text.style.cssText = 'margin:0 0 0.9rem;';
    text.textContent = 'We would like to use analytics cookies to see which issues get read. ' +
      'They stay off unless you accept.';
    text.appendChild(document.createTextNode(' '));
    var more = document.createElement('a');
    more.href = PRIVACY_URL;
    more.textContent = 'Privacy';
    more.style.cssText = 'color:inherit;text-decoration:underline;';
    text.appendChild(more);
    var actions = document.createElement('div');
    actions.style.cssText = 'display:flex;gap:0.6rem;flex-wrap:wrap;';
    var base = "font-family:'DM Mono',monospace;font-size:0.72rem;letter-spacing:0.08em;" +
      'text-transform:uppercase;padding:0.55rem 1rem;border-radius:var(--radius,4px);cursor:pointer;';
    var accept = document.createElement('button');
    accept.type = 'button';
    accept.textContent = 'Accept';
    accept.style.cssText = base + 'background:var(--gold,#C9A84C);color:#0A0A0A;border:1px solid var(--gold,#C9A84C);';
    var decline = document.createElement('button');
    decline.type = 'button';
    decline.textContent = 'Decline';
    decline.style.cssText = base + 'background:transparent;color:var(--white,#F5F2EC);border:1px solid var(--muted,#888880);';
    accept.addEventListener('click', function () {
      remember('yes');
      banner.hidden = true;
      load();
    });
    decline.addEventListener('click', function () {
      var wasOn = loaded;
      remember('no');
      banner.hidden = true;
      // Withdrawing consent: stop capturing now and start clean on next load.
      if (wasOn && window.posthog && window.posthog.opt_out_capturing) window.posthog.opt_out_capturing();
    });
    actions.appendChild(accept);
    actions.appendChild(decline);
    banner.appendChild(text);
    banner.appendChild(actions);
    document.body.appendChild(banner);
  }

  function addSettingsLink() {
    var footer = document.querySelector('footer');
    if (!footer) return;
    var link = document.createElement('a');
    link.href = '#';
    link.textContent = 'Cookie settings';
    link.style.cssText = "display:block;margin-top:0.75rem;font-family:'DM Mono',monospace;" +
      'font-size:0.7rem;letter-spacing:0.08em;text-transform:uppercase;color:var(--muted,#888880);';
    link.addEventListener('click', function (e) {
      e.preventDefault();
      showBanner();
    });
    footer.appendChild(link);
  }

  function start() {
    addSettingsLink();
    var c = choice();
    if (c === 'yes') load();
    else if (c !== 'no') showBanner();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
