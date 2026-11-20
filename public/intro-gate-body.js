/* Runs immediately after the shared static shell in index.html.
   On inner routes the shell is never wanted: remove it from the DOM so even
   its poster image is not fetched. On home it stays for the first paint and
   IntroSplash.tsx takes it over after hydration. */
(function () {
  var path = window.location.pathname;
  if (path !== '/' && path !== '') {
    var shell = document.getElementById('intro-static');
    if (shell) shell.remove();
  }
})();
