/*  Shared burger-menu — drop-in for every page that has a navbar.
    Replicates the same slide-down category panel used on the Fever home page.
    If the page already contains a #burger-menu-panel the script does nothing. */
(function () {
  'use strict';

  if (document.getElementById('burger-menu-panel')) return;

  /* ── Resolve the base path so links (category.html, etc.) work
        regardless of page depth (root, /option-b/, /prototypes/…/…). ── */
  var depth = 0;
  try {
    var path = window.location.pathname.replace(/\/[^/]*$/, '/');
    var parts = path.split('/').filter(Boolean);
    var repoIdx = -1;
    for (var i = 0; i < parts.length; i++) {
      if (parts[i] === 'music_festival_flows_cross_sell') { repoIdx = i; break; }
    }
    if (repoIdx >= 0) {
      depth = parts.length - repoIdx - 1;
    } else {
      var segs = path.replace(/^\//, '').split('/').filter(Boolean);
      depth = segs.length;
    }
  } catch (e) { depth = 0; }
  var base = depth === 0 ? '' : new Array(depth).fill('..').join('/') + '/';

  /* ── CSS ── */
  var style = document.createElement('style');
  style.textContent =
    '.burger-toggle .icon-close{display:none}' +
    '.phone.is-menu-open .burger-toggle .icon-menu{display:none}' +
    '.phone.is-menu-open .burger-toggle .icon-close{display:block}' +
    '.burger-menu-panel{background:#fafbfb;max-height:0;overflow:hidden;opacity:0;' +
      'transform:translateY(-12px);' +
      'transition:max-height .35s cubic-bezier(.4,0,.2,1),opacity .3s ease,transform .35s cubic-bezier(.4,0,.2,1)}' +
    '.phone.is-menu-open .burger-menu-panel{max-height:calc(100vh - 63px);overflow-y:auto;opacity:1;transform:translateY(0)}' +
    '.burger-location-lang{height:44px;border-top:1px solid #E6EAEE;border-bottom:1px solid #E6EAEE;background:#fff;padding:0 8px;display:flex;align-items:center;justify-content:space-between}' +
    '.burger-location{display:inline-flex;align-items:center;gap:6px;font-size:16px}' +
    '.burger-location span{font-size:16px;line-height:24px;font-weight:500;color:#031419}' +
    '.burger-divider{width:1px;align-self:stretch;background:#ccd2d8;margin:0 16px}' +
    '.burger-lang{display:inline-flex;align-items:center;gap:4px;font-size:16px;line-height:24px;color:#031419;font-weight:400}' +
    '.burger-lang svg,.burger-location svg{width:20px;height:20px;flex-shrink:0;stroke-width:1.7}' +
    '.burger-menu-content{padding:16px 15px 24px}' +
    '.burger-menu-content h2{font-size:16px;line-height:24px;font-weight:600;color:#031419;margin-bottom:16px}' +
    '.burger-category-list{list-style:none;display:flex;flex-direction:column;margin:0;padding:0}' +
    '.burger-category-item{display:flex;align-items:center;gap:8px;padding:8px 0;min-height:64px;text-decoration:none;color:inherit}' +
    '.burger-category-thumb{width:48px;height:38px;border-radius:8px;object-fit:cover;flex-shrink:0}' +
    '.burger-category-item span{font-size:14px;line-height:20px;color:#031419;font-weight:400}';
  document.head.appendChild(style);

  /* ── Panel HTML ── */
  var categories = [
    { slug: 'fever-originals', label: 'Fever Originals', img: 'https://www.figma.com/api/mcp/asset/7b2e86ce-a78f-442f-bc16-6f71eee07d8c' },
    { slug: 'food-drinks',     label: 'Food & Drinks',   img: 'https://www.figma.com/api/mcp/asset/e0941f08-df38-4cbe-b647-618fbd7bb268' },
    { slug: 'activities-games',label: 'Activities & Games',img: 'https://www.figma.com/api/mcp/asset/dbb1e8a5-7c01-4b7a-987a-2590c36feeb9' },
    { slug: 'candlelight',     label: 'Candlelight Concerts', img: 'https://www.figma.com/api/mcp/asset/cbc97314-1c48-4c17-9f37-84055a16732d' },
    { slug: 'culture-arts',    label: 'Culture, Arts & Fashion', img: 'https://www.figma.com/api/mcp/asset/33f691c3-6a6f-42c6-9127-65416cad28e7' },
    { slug: 'shows',           label: 'Live Shows & Performances', img: 'https://www.figma.com/api/mcp/asset/1c263bd4-0f90-4ba5-949f-a7e796abd028' },
    { slug: 'brunches',        label: 'Brunches',        img: 'https://www.figma.com/api/mcp/asset/9e34fb03-3db7-423a-9134-cba99707bdf3' },
    { slug: 'family',          label: 'Family',          img: 'https://www.figma.com/api/mcp/asset/3c441b0e-0482-47cb-83ef-fdd1c4bd68b5' },
    { slug: 'sports',          label: 'Sports & Outdoors', img: 'https://www.figma.com/api/mcp/asset/dbb1e8a5-7c01-4b7a-987a-2590c36feeb9' }
  ];

  var listItems = categories.map(function (c) {
    return '<li><a href="' + base + 'category.html?cat=' + c.slug + '" class="burger-category-item">' +
      '<img class="burger-category-thumb" src="' + c.img + '" alt="' + c.label + '">' +
      '<span>' + c.label + '</span></a></li>';
  }).join('');

  var panelHTML =
    '<div class="burger-menu-panel" id="burger-menu-panel" aria-hidden="true">' +
      '<div class="burger-location-lang">' +
        '<div class="burger-location">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>' +
          '<span>Madrid</span>' +
        '</div>' +
        '<div style="display:flex;align-items:center;">' +
          '<div class="burger-divider"></div>' +
          '<div class="burger-lang">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c3 3 3 15 0 18"/><path d="M12 3c-3 3-3 15 0 18"/></svg>' +
            ' EN' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="burger-menu-content">' +
        '<h2>Categories</h2>' +
        '<ul class="burger-category-list">' + listItems + '</ul>' +
      '</div>' +
    '</div>';

  /* ── Find & replace the hamburger icon ── */
  var navbar = document.querySelector('.navbar, nav.navbar');
  if (!navbar) return;

  var hamburgerSvg = null;
  var hamburgerParent = null;
  var allSvgs = navbar.querySelectorAll('svg');
  for (var s = 0; s < allSvgs.length; s++) {
    var lines = allSvgs[s].querySelectorAll('line');
    if (lines.length === 3) { hamburgerSvg = allSvgs[s]; break; }
  }
  if (!hamburgerSvg) return;

  hamburgerParent = hamburgerSvg.parentElement;

  var btn;
  var existingToggle = navbar.querySelector('.js-burger-toggle');
  if (existingToggle) {
    btn = existingToggle;
    if (!btn.querySelector('.icon-close')) {
      var closeSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      closeSvg.setAttribute('class', 'icon-close');
      closeSvg.setAttribute('viewBox', '0 0 24 24');
      closeSvg.setAttribute('fill', 'none');
      closeSvg.setAttribute('stroke', 'currentColor');
      closeSvg.setAttribute('stroke-width', '2');
      closeSvg.innerHTML = '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>';
      btn.appendChild(closeSvg);
    }
    if (!hamburgerSvg.classList.contains('icon-menu')) {
      hamburgerSvg.classList.add('icon-menu');
    }
  } else {
    btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-icon-btn burger-toggle js-burger-toggle';
    btn.setAttribute('aria-label', 'Open menu');
    btn.setAttribute('aria-expanded', 'false');

    var menuIcon = hamburgerSvg.cloneNode(true);
    menuIcon.classList.add('icon-menu');

    var closeIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    closeIcon.setAttribute('class', 'icon-close');
    closeIcon.setAttribute('viewBox', '0 0 24 24');
    closeIcon.setAttribute('fill', 'none');
    closeIcon.setAttribute('stroke', 'currentColor');
    closeIcon.setAttribute('stroke-width', '2');
    closeIcon.innerHTML = '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>';

    btn.appendChild(menuIcon);
    btn.appendChild(closeIcon);

    if (hamburgerParent.tagName === 'A' || hamburgerParent.classList.contains('nav-icon-btn')) {
      hamburgerParent.parentNode.replaceChild(btn, hamburgerParent);
    } else {
      hamburgerSvg.parentNode.replaceChild(btn, hamburgerSvg);
    }
  }

  /* ── Inject panel after <nav> (inside .phone / sticky-header) ── */
  var stickyHeader = navbar.closest('.sticky-header');
  var insertAfter = stickyHeader || navbar;
  insertAfter.insertAdjacentHTML('afterend', panelHTML);

  /* ── Toggle logic ── */
  var phone = document.querySelector('.phone');
  var panel = document.getElementById('burger-menu-panel');
  if (!phone || !panel) return;

  var savedScrollY = 0;
  btn.addEventListener('click', function () {
    var wasOpen = phone.classList.contains('is-menu-open');
    if (!wasOpen) savedScrollY = window.scrollY;
    var isOpen = phone.classList.toggle('is-menu-open');
    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    btn.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    panel.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    if (!isOpen) {
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, savedScrollY);
      document.documentElement.style.scrollBehavior = '';
    }
  });
})();
