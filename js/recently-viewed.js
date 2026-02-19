(function() {
  var RV_KEY = 'fever_recently_viewed';
  var MAX_ITEMS = 20;

  function readItems() {
    try { return JSON.parse(localStorage.getItem(RV_KEY)) || []; }
    catch (e) { return []; }
  }

  function writeItems(items) {
    try { localStorage.setItem(RV_KEY, JSON.stringify(items)); } catch (e) {}
  }

  var title = '';
  var titleEl = document.querySelector('h1') || document.querySelector('.plan-title') || document.querySelector('.hero-title');
  if (titleEl) title = titleEl.textContent.trim();
  if (!title) {
    var t = document.title || '';
    title = t.replace(/\s*[-|–—].*$/, '').trim();
  }
  if (!title) return;

  var image = '';
  var heroImg = document.querySelector('.carousel-slide img') ||
                document.querySelector('.hero-bg') ||
                document.querySelector('.hero img') ||
                document.querySelector('#hero-img');
  if (heroImg) {
    image = heroImg.tagName === 'IMG' ? heroImg.src : '';
    if (!image && heroImg.style && heroImg.style.backgroundImage) {
      var m = heroImg.style.backgroundImage.match(/url\(["']?([^"')]+)/);
      if (m) image = m[1];
    }
  }

  var meta = '';
  var ratingEl = document.querySelector('.hero-rating') || document.querySelector('.rating');
  if (ratingEl) meta = ratingEl.textContent.trim();

  var price = '';
  var priceEl = document.querySelector('.sticky-cta .cta-price') || document.querySelector('.cta-btn');
  if (priceEl) {
    var priceMatch = priceEl.textContent.match(/[\$€£]\s*[\d,.]+/);
    if (priceMatch) price = 'From ' + priceMatch[0];
  }

  var badge = '';
  var badgeEl = document.querySelector('.card-badge') || document.querySelector('.hero-badge');
  if (badgeEl) badge = badgeEl.textContent.trim();

  var id = window.location.pathname.split('/').pop().replace(/\.html$/, '') || 'plan';
  var params = new URLSearchParams(window.location.search);
  var planParam = params.get('plan');
  if (planParam) id = planParam;
  var flowParam = params.get('flow');

  var href = window.location.pathname;
  if (flowParam) href += '?flow=' + flowParam;

  var entry = {
    id: id,
    title: title,
    image: image,
    meta: meta,
    price: price,
    badge: badge,
    href: href,
    ts: Date.now()
  };

  var items = readItems().filter(function(it) { return it && it.id !== id; });
  items.unshift(entry);
  if (items.length > MAX_ITEMS) items = items.slice(0, MAX_ITEMS);
  writeItems(items);
})();
