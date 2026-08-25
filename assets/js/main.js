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

  /* ---------- przejście hero 1 -> hero 2 ---------- */
  /* Hero 1 jest przyklejone, hero 2 wjeżdża na nie w normalnym przepływie.
     Treść pierwszego gaśnie i lekko odjeżdża, żeby to nie było samo nasunięcie. */
  var hero2 = document.getElementById('marka');
  var heroInner = document.getElementById('hero-inner');
  if (hero2 && heroInner && !reduced) {
    var queued = false;
    var fade = function () {
      var t = 1 - hero2.getBoundingClientRect().top / window.innerHeight;
      t = Math.min(1, Math.max(0, t));
      heroInner.style.opacity = Math.max(0, 1 - t * 1.7).toFixed(3);
      heroInner.style.transform =
        'translate3d(0,' + (-t * 44).toFixed(1) + 'px,0) scale(' + (1 - t * 0.07).toFixed(3) + ')';
    };
    window.addEventListener('scroll', function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; fade(); });
    }, { passive: true });
    fade();
  }

  /* ---------- szew pętli wideo ---------- */
  /* Wideo zaczyna się ziarnami, a kończy sernikiem, więc zapętlenie widać jako
     twarde cięcie. Krótkie przyciemnienie na styku zamienia je w miękki przeskok.
     Pętla chodzi tylko wtedy, gdy hero jest na ekranie. */
  var dip = document.getElementById('hero-dip');
  if (dip && video && !reduced) {
    var RAMP = 0.55;          /* sekundy po obu stronach szwu */
    var MAX = 0.88;
    var alive = false;

    var tick = function () {
      if (!alive) return;
      var d = video.duration;
      if (d && !isNaN(d)) {
        var t = video.currentTime, o = 0;
        if (t > d - RAMP) o = (t - (d - RAMP)) / RAMP;
        else if (t < RAMP) o = 1 - t / RAMP;
        /* smoothstep, żeby przyciemnienie nie właczało się liniowo */
        o = o * o * (3 - 2 * o);
        dip.style.opacity = (o * MAX).toFixed(3);
      }
      requestAnimationFrame(tick);
    };

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        var vis = entries[0].isIntersecting;
        if (vis && !alive) { alive = true; requestAnimationFrame(tick); }
        else if (!vis) { alive = false; dip.style.opacity = '0'; }
      }, { threshold: 0 }).observe(video);
    } else {
      alive = true; requestAnimationFrame(tick);
    }
  }

  /* ---------- karuzela 3D (coverflow) ---------- */
  /* Port komponentu reactowego na czysty DOM — projekt nie ma Reacta,
     Tailwinda ani kroku budowania. Zachowanie to samo: autoplay z pauzą
     na hover, strzałki, kropki, klawiatura i swipe. */
  (function () {
    var root = document.getElementById('cf');
    if (!root) return;
    var cards = Array.prototype.slice.call(root.querySelectorAll('.cf__card'));
    var dotsBox = document.getElementById('cf-dots');
    var total = cards.length;
    if (!total) return;

    var index = 0;
    var timer = null;
    var DELAY = 5000;

    /* Układ coverflow: przesunięcie, skala i obrót dla każdej pozycji
       względem środka. Odległość w px skaluje się z szerokością karty. */
    var step = function () {
      return Math.min(285, cards[0].getBoundingClientRect().width * 0.88);
    };

    function layout() {
      var d = step();
      cards.forEach(function (card, i) {
        var off = (i - index + total) % total;
        var x = 0, sc = 0.4, rot = 0, op = 0, z = 0, fil = 'brightness(.4) blur(2px)';
        var center = false;

        if (off === 0) { center = true; x = 0; sc = 1; rot = 0; op = 1; z = 30; fil = 'none'; }
        else if (off === 1) { x = d; sc = .84; rot = -24; op = .65; z = 20; fil = 'brightness(.78)'; }
        else if (off === 2) { x = d * 1.79; sc = .68; rot = -38; op = .38; z = 10; fil = 'brightness(.6) blur(1px)'; }
        else if (off === total - 1) { x = -d; sc = .84; rot = 24; op = .65; z = 20; fil = 'brightness(.78)'; }
        else if (off === total - 2) { x = -d * 1.79; sc = .68; rot = 38; op = .38; z = 10; fil = 'brightness(.6) blur(1px)'; }

        card.style.transform = 'translateX(' + x.toFixed(1) + 'px) scale(' + sc + ') rotateY(' + rot + 'deg)';
        card.style.opacity = op;
        card.style.zIndex = z;
        card.style.filter = fil;
        card.style.boxShadow = center
          ? '0 25px 60px rgba(42,33,26,.38), 0 0 34px rgba(176,112,58,.2)'
          : '0 15px 35px rgba(42,33,26,.22)';
        card.style.cursor = center ? 'default' : 'pointer';
        card.classList.toggle('is-center', center);
        /* Poza środkiem karta jest ozdobą — chowamy ją przed czytnikiem ekranu. */
        card.setAttribute('aria-hidden', center ? 'false' : 'true');
      });

      Array.prototype.forEach.call(dotsBox.children, function (b, i) {
        b.setAttribute('aria-selected', i === index ? 'true' : 'false');
      });
    }

    function go(i) { index = ((i % total) + total) % total; layout(); }
    function next() { go(index + 1); }
    function prev() { go(index - 1); }

    /* kropki */
    for (var i = 0; i < total; i++) {
      (function (i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-label', 'Slajd ' + (i + 1) + ' z ' + total);
        b.addEventListener('click', function () { go(i); restart(); });
        dotsBox.appendChild(b);
      })(i);
    }

    cards.forEach(function (card, i) {
      card.addEventListener('click', function () {
        if (!card.classList.contains('is-center')) { go(i); restart(); }
      });
    });

    document.getElementById('cf-prev').addEventListener('click', function () { prev(); restart(); });
    document.getElementById('cf-next').addEventListener('click', function () { next(); restart(); });

    /* autoplay — stoi na hover, przy schowanej karcie i poza ekranem */
    function start() { if (!timer && !reduced) timer = setInterval(next, DELAY); }
    function stop() { clearInterval(timer); timer = null; }
    function restart() { stop(); start(); }

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', start);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });

    /* klawiatura — tylko gdy karuzela jest na ekranie, żeby nie przechwytywać
       strzałek podczas czytania reszty strony */
    var onScreen = false;
    document.addEventListener('keydown', function (e) {
      if (!onScreen) return;
      if (e.key === 'ArrowLeft') { prev(); restart(); }
      if (e.key === 'ArrowRight') { next(); restart(); }
    });

    /* swipe */
    var x0 = null;
    root.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; stop(); }, { passive: true });
    root.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 45) { dx < 0 ? next() : prev(); }
      x0 = null; start();
    }, { passive: true });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        onScreen = en[0].isIntersecting;
        if (onScreen) start(); else stop();
      }, { threshold: 0.2 }).observe(root);
    } else { onScreen = true; start(); }

    window.addEventListener('resize', layout, { passive: true });
    layout();
  })();

  /* ---------- nawigacja ---------- */
  var nav = document.getElementById('nav');
  if (nav) {
    /* Kremowy pasek dopiero wtedy, gdy hero 2 dojdzie pod nawigację.
       Progiem nie może być zwykłe scrollY > 40, bo nad wideo pasek musi
       zostać przezroczysty przez całą wysokość pierwszego ekranu. */
    var stick = function () {
      var zakryte = hero2
        ? hero2.getBoundingClientRect().top <= nav.offsetHeight + 8
        : window.scrollY > 40;
      nav.classList.toggle('is-stuck', zakryte);
    };
    stick();
    window.addEventListener('scroll', stick, { passive: true });
    window.addEventListener('resize', stick, { passive: true });
  }
})();
