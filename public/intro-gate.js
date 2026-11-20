/* Intro gate — runs synchronously in <head> on every route.
   The static intro shell in index.html is shared by all routes on static
   hosting (Cloudflare Pages). Show it only on the home page; drop the poster
   preload everywhere else so inner routes never fetch the intro asset. */
(function () {
  var path = window.location.pathname;
  if (path !== '/' && path !== '') {
    document.documentElement.setAttribute('data-intro-page', 'off');
    var preload = document.querySelector('link[rel="preload"][as="image"][href*="sud-intro-251-poster"]');
    if (preload) preload.remove();
  }
})();
