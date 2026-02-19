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
    '.burger-toggle{width:24px;height:24px;position:relative}' +
    '.burger-toggle svg{position:absolute;top:0;left:50%;transform:translateX(-50%)}' +
    '.burger-toggle .icon-close{display:none}' +
    '.phone.is-menu-open .burger-toggle .icon-menu{display:none}' +
    '.phone.is-menu-open .burger-toggle .icon-close{display:block}' +
    '.burger-menu-backdrop{position:fixed;inset:0;background:rgba(3,20,25,0.35);opacity:0;pointer-events:none;transition:opacity .25s ease;z-index:99}' +
    '.burger-menu-backdrop.open{opacity:1;pointer-events:auto}' +
    '.burger-menu-panel{position:fixed;top:0;left:50%;transform:translateX(-50%) translateY(-12px);width:393px;max-width:100vw;' +
      'background:#fafbfb;max-height:0;overflow:hidden;opacity:0;z-index:100;' +
      'transition:max-height .35s cubic-bezier(.4,0,.2,1),opacity .3s ease,transform .35s cubic-bezier(.4,0,.2,1)}' +
    '.burger-menu-panel.open{max-height:calc(100vh - 63px);overflow-y:auto;opacity:1;transform:translateX(-50%) translateY(0)}' +
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

  // Strategy 1: find by aria-label="Menu" or "Open menu"
  var menuBtn = navbar.querySelector('[aria-label="Menu"], [aria-label="Open menu"]');
  if (menuBtn) {
    hamburgerSvg = menuBtn.querySelector('svg');
    if (!hamburgerSvg && menuBtn.tagName === 'SVG') hamburgerSvg = menuBtn;
  }

  // Strategy 2: fall back to SVG with 3 <line> elements (legacy home.html format)
  if (!hamburgerSvg) {
    var allSvgs = navbar.querySelectorAll('svg');
    for (var s = 0; s < allSvgs.length; s++) {
      var lines = allSvgs[s].querySelectorAll('line');
      if (lines.length === 3) { hamburgerSvg = allSvgs[s]; break; }
    }
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

  /* ── Inject backdrop + panel into <body> (fixed overlay) ── */
  var backdrop = document.createElement('div');
  backdrop.className = 'burger-menu-backdrop';
  backdrop.id = 'burger-menu-backdrop';
  document.body.appendChild(backdrop);

  document.body.insertAdjacentHTML('beforeend', panelHTML);

  /* ── Position panel below the sticky header ── */
  var panel = document.getElementById('burger-menu-panel');
  if (!panel) return;

  function positionPanel() {
    var stickyHeader = document.querySelector('.sticky-header');
    var ref = stickyHeader || navbar;
    var rect = ref.getBoundingClientRect();
    panel.style.top = rect.bottom + 'px';
  }

  /* ── Toggle logic ── */
  var phone = document.querySelector('.phone');
  var isOpen = false;

  function openMenu() {
    isOpen = true;
    positionPanel();
    phone && phone.classList.add('is-menu-open');
    panel.classList.add('open');
    backdrop.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Close menu');
    panel.setAttribute('aria-hidden', 'false');
  }

  function closeMenu() {
    isOpen = false;
    phone && phone.classList.remove('is-menu-open');
    panel.classList.remove('open');
    backdrop.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Open menu');
    panel.setAttribute('aria-hidden', 'true');
  }

  btn.addEventListener('click', function () {
    if (isOpen) closeMenu(); else openMenu();
  });

  backdrop.addEventListener('click', closeMenu);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) closeMenu();
  });
})();
