// Wires the configurable links (config.js), fills the download section from the signed update manifest, closes the
// mobile menu after a jump, and reveals sections on scroll.
(function () {
  var site = window.KAYZER_SITE || {};

  document.querySelectorAll('[data-link]').forEach(function (el) {
    var key = el.getAttribute('data-link');
    var url = site[key];
    if (key === 'email' && url && url.indexOf('mailto:') !== 0) url = 'mailto:' + url;
    if (url) {
      el.href = url;
      if (/^https?:/.test(url) && key !== 'download') { el.target = '_blank'; el.rel = 'noopener'; }
    } else {
      el.removeAttribute('href');
      el.setAttribute('aria-disabled', 'true');
      el.setAttribute('role', 'link');
      if (el.classList.contains('btn')) el.textContent = 'Bientôt disponible';
    }
  });

  // Latest published version, read from the same manifest the software follows. The download link is only replaced
  // by an address of the official public repository; otherwise the static link from config.js stays.
  var release = document.querySelector('[data-release-root]');
  if (release && window.fetch && window.TextDecoder) {
    fetch('updates/stable/manifest.json', { cache: 'no-store' })
      .then(function (response) { if (!response.ok) throw new Error(response.status); return response.json(); })
      .then(function (envelope) {
        var bytes = Uint8Array.from(atob(envelope.payload), function (c) { return c.charCodeAt(0); });
        var manifest = JSON.parse(new TextDecoder('utf-8').decode(bytes));
        var latest = manifest.latest;
        if (!latest || latest.status !== 'published') return;
        var date = new Date(latest.releaseDate);
        release.querySelector('[data-release="version"]').textContent = 'Version ' + latest.version;
        release.querySelector('[data-release="meta"]').textContent =
          'Publiée le ' + date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) +
          ' · ' + (latest.packageSize / 1048576).toFixed(1).replace('.', ',') + ' Mo · Windows 11 64 bits';
        var notes = release.querySelector('[data-release="notes"]');
        (latest.notes || []).forEach(function (text) {
          var li = document.createElement('li');
          li.textContent = text;
          notes.appendChild(li);
        });
        notes.hidden = notes.children.length === 0;
        var sha = release.querySelector('[data-release="sha"]');
        sha.textContent = 'SHA-256 : ' + latest.packageSha256;
        sha.hidden = false;
        if (/^https:\/\/github\.com\/NotEcoo\/kayzer\/releases\/download\//.test(latest.packageUrl)) {
          release.querySelectorAll('[data-release="link"]').forEach(function (a) { a.href = latest.packageUrl; });
        }
      })
      .catch(function () { /* keep the static link and texts */ });
  }

  var toggle = document.getElementById('nav-toggle');
  document.querySelectorAll('.nav a').forEach(function (a) {
    a.addEventListener('click', function () { if (toggle) toggle.checked = false; });
  });

  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  items.forEach(function (el) { observer.observe(el); });
})();
