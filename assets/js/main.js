/* ===========================================================
   CIEkawa Kawiarnia
   Hero to zapętlone wideo odtwarzane samo z siebie.
   =========================================================== */
(function () {
  'use strict';

  var MOBILE_BREAK = 760;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- wideo w hero ---------- */
  var video = document.getElementById('hero-video');
  if (video) {
    /* Źródło dobierane po szerokości ekranu, a nie przez <source media>,
       bo przeglądarki przestały honorować media na źródłach wideo.
       Bez JS zostaje plakat ustawiony w atrybucie poster. */
    video.src = window.innerWidth <= MOBILE_BREAK
      ? 'assets/video/hero-540.mp4'
      : 'assets/video/hero.mp4';

    if (reduced) {
      /* Przy wyłączonych animacjach pokazujemy jeden kadr zamiast pętli. */
      video.removeAttribute('autoplay');
      video.pause();
    } else {
      /* Safari na iOS potrafi odmówić autoplay do pierwszej interakcji. */
      var play = function () {
        var p = video.play();
        if (p && p.catch) p.catch(function () {});
      };
      play();
      video.addEventListener('loadeddata', play, { once: true });
      document.addEventListener('visibilitychange', function () {
        if (!document.hidden) play();
      });
    }
  }

  /* ---------- nawigacja ---------- */
  var nav = document.getElementById('nav');
  if (nav) {
    var stick = function () { nav.classList.toggle('is-stuck', window.scrollY > 40); };
    stick();
    window.addEventListener('scroll', stick, { passive: true });
  }
})();
