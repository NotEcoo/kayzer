// Wires the configurable links (config.js), closes the mobile menu after a jump, and reveals sections on scroll.
(function () {
  var site = window.KAYZER_SITE || {};

  document.querySelectorAll('[data-link]').forEach(function (el) {
    var key = el.getAttribute('data-link');
    var url = site[key];
    if (key === 'email' && url && url.indexOf('mailto:') !== 0) url = 'mailto:' + url;
    // Download buttons fall back to the trial link, and the reverse, when only one is set.
    if (!url && key === 'download') url = site.trial;
    if (!url && key === 'trial') url = site.download;
    if (url) {
      el.href = url;
      if (/^https?:/.test(url)) { el.target = '_blank'; el.rel = 'noopener'; }
    } else if (key === 'download' || key === 'trial') {
      el.href = '#offres';
    } else {
      el.removeAttribute('href');
      el.setAttribute('aria-disabled', 'true');
      el.setAttribute('role', 'link');
      if (el.classList.contains('btn')) el.textContent = 'Bientôt disponible';
    }
  });

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
