/**
 * Auto-detect the current flow and propagate ?flow=XX to all URLs.
 * - Reads flow from URL param or infers from directory path
 * - Updates the URL bar via history.replaceState (no reload)
 * - Adds ?flow=XX to all <a> links on the page
 * - Exposes window.flowHref(url) helper for JS navigations
 */
(function() {
  var params = new URLSearchParams(window.location.search);
  var flow = params.get('flow');

  if (!flow) {
    var path = window.location.pathname;
    if (/\/a2\//.test(path)) flow = 'a2';
    else if (/\/b1\//.test(path)) flow = 'b1';
    else if (/\/b2\//.test(path)) flow = 'b2';
    else if (/\/c1\//.test(path)) flow = 'c1';
    else if (/\/c2\//.test(path)) flow = 'c2';
    else if (/\/d1\//.test(path)) flow = 'd1';
    else if (/\/d2\//.test(path)) flow = 'd2';
    else if (/\/e1\//.test(path)) flow = 'e1';
    else if (/\/e2\//.test(path)) flow = 'e2';
    else if (/\/option-c\//.test(path)) flow = 'option-c';
    else if (/\/option-e\//.test(path)) flow = 'option-e';
    else if (/\/option-f\//.test(path)) flow = 'option-f';
  }

  if (!flow) return;

  window.__currentFlow = flow;

  if (!params.has('flow')) {
    try {
      var url = new URL(window.location.href);
      url.searchParams.set('flow', flow);
      history.replaceState(null, '', url.pathname + url.search + url.hash);
    } catch (e) {}
  }

  function appendFlow(href) {
    if (!href || href.charAt(0) === '#' || href.indexOf('javascript:') === 0 ||
        href.indexOf('mailto:') === 0 || href.indexOf('http') === 0 ||
        href.indexOf('flow=') !== -1) return href;
    var hash = '';
    var hashIdx = href.indexOf('#');
    if (hashIdx >= 0) { hash = href.substring(hashIdx); href = href.substring(0, hashIdx); }
    var sep = href.indexOf('?') >= 0 ? '&' : '?';
    return href + sep + 'flow=' + flow + hash;
  }

  window.flowHref = appendFlow;

  function processLinks() {
    var links = document.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#' || href.indexOf('javascript:') === 0 ||
          href.indexOf('mailto:') === 0 || href.indexOf('http') === 0 ||
          href.indexOf('flow=') !== -1) continue;
      a.setAttribute('href', appendFlow(href));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', processLinks);
  } else {
    processLinks();
  }

  var pending = null;
  var obs = new MutationObserver(function() {
    if (pending) return;
    pending = setTimeout(function() { pending = null; processLinks(); }, 50);
  });
  var target = document.body || document.documentElement;
  if (target) obs.observe(target, { childList: true, subtree: true });
  else document.addEventListener('DOMContentLoaded', function() {
    obs.observe(document.body, { childList: true, subtree: true });
  });
})();
