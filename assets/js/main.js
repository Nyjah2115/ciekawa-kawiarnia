/* ===========================================================
   CIEkawa Kawiarnia — hero sterowany scrollem
   Sekwencja klatek wyciętych z wideo rysowana na <canvas>:
   przewijanie strony = przewijanie filmu (scrubbing).
   =========================================================== */
(function () {
  'use strict';

  var FRAMES_DESKTOP = 96;
  var FRAMES_MOBILE = 48;   /* telefon dostaje o połowę lżejszy pakiet klatek */
  var MOBILE_BREAK = 760;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var section  = document.querySelector('.scrollytelling');
  var sticky   = document.querySelector('.sticky');
  var canvas   = document.getElementById('hero-canvas');
  var fallback = document.getElementById('hero-fallback');
  var loader   = document.getElementById('loader');
  var fill     = document.getElementById('loader-fill');
  var hint     = document.getElementById('hint');
  var beats    = Array.prototype.slice.call(document.querySelectorAll('.beat'));
  var nav      = document.getElementById('nav');
  if (!section || !canvas) return;

  var ctx = canvas.getContext('2d', { alpha: false });

  /* Kadr, w którym pojawia się dany napis: [wejście, pełna widoczność od, do, wyjście] */
  var BEATS = [
    [-0.020, -0.010, 0.110, 0.165],
    [0.175, 0.215, 0.300, 0.350],
    [0.375, 0.415, 0.545, 0.600],
    [0.640, 0.680, 0.780, 0.825],
    [0.860, 0.900, 1.010, 1.020]   /* poza 1.0, żeby napis nie gasł na końcu scrolla */
  ];

  /* ---------- wczytywanie klatek ---------- */
  var isMobile = window.innerWidth <= MOBILE_BREAK;
  var dir = isMobile ? 'sm' : 'lg';
  var FRAMES = isMobile ? FRAMES_MOBILE : FRAMES_DESKTOP;
  var images = new Array(FRAMES);
  var ready  = new Array(FRAMES);
  var loaded = 0;
  var firstPainted = false;

  function src(i) {
    return 'assets/frames/' + dir + '/' + String(i).padStart(3, '0') + '.jpg';
  }

  function finishLoading() {
    if (loader) loader.classList.add('is-done');
    if (hint) hint.classList.add('is-ready');
  }

  function load(i, onDone) {
    if (images[i]) return;
    var img = new Image();
    img.decoding = 'async';
    img.onload = function () {
      ready[i] = true;
      loaded++;
      if (fill) fill.style.width = Math.round((loaded / FRAMES) * 100) + '%';
      if (!firstPainted) { firstPainted = true; lastKey = ''; render(shown); }
      else if (!running) { lastKey = ''; render(shown); }
      if (loaded >= FRAMES) finishLoading();
      if (onDone) onDone();
    };
    img.onerror = function () { loaded++; if (loaded >= FRAMES) finishLoading(); };
    img.src = src(i);
    images[i] = img;
  }

  /* Najpierw co ósma klatka (żeby szkielet animacji był gotowy od razu),
     potem reszta w tle — strona jest używalna zanim doczyta się wszystko. */
  function preload() {
    var order = [];
    for (var step = isMobile ? 4 : 8; step >= 1; step = step >> 1) {
      for (var i = 0; i < FRAMES; i += step) if (order.indexOf(i) === -1) order.push(i);
    }
    for (var j = 0; j < FRAMES; j++) if (order.indexOf(j) === -1) order.push(j);

    var k = 0;
    (function next() {
      var burst = 0;
      while (k < order.length && burst < 6) { load(order[k++]); burst++; }
      if (k < order.length) setTimeout(next, 90);
    })();
  }

  /* ---------- rysowanie ---------- */

  function sizeCanvas() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = sticky.clientWidth, h = sticky.clientHeight;
    canvas.width  = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width  = w + 'px';
    canvas.style.height = h + 'px';
    lastKey = '';
  }

  function nearestReady(i) {
    if (ready[i]) return i;
    for (var d = 1; d < FRAMES; d++) {
      if (i - d >= 0 && ready[i - d]) return i - d;
      if (i + d < FRAMES && ready[i + d]) return i + d;
    }
    return -1;
  }

  function paint(img) {
    var cw = canvas.width, ch = canvas.height;
    var s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    var w = img.naturalWidth * s, h = img.naturalHeight * s;
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  }

  /* Geometria sekcji czytana raz, nie przy każdej klatce — odczyt offsetTop
     w pętli renderowania wymuszałby przeliczenie layoutu 60 razy na sekundę. */
  var geo = { top: 0, travel: 1 };
  function measure() {
    geo.top = section.offsetTop;
    geo.travel = Math.max(1, section.offsetHeight - sticky.clientHeight);
  }

  function rawProgress() {
    return Math.min(1, Math.max(0, (window.scrollY - geo.top) / geo.travel));
  }

  function smoothstep(t) { return t * t * (3 - 2 * t); }

  function fade(p, b) {
    if (p <= b[0] || p >= b[3]) return 0;
    if (p < b[1]) return smoothstep((p - b[0]) / (b[1] - b[0] || 1));
    if (p > b[2]) return smoothstep(1 - (p - b[2]) / (b[3] - b[2] || 1));
    return 1;
  }

  /* ---------- renderowanie z podklatkową interpolacją ---------- */
  var lastKey = '';

  function render(p) {
    var f = p * (FRAMES - 1);
    var i0 = Math.floor(f);
    var frac = f - i0;
    var i1 = Math.min(FRAMES - 1, i0 + 1);

    var a = nearestReady(i0);
    if (a !== -1) {
      /* Mieszamy dwie sąsiednie klatki proporcjonalnie do pozycji między nimi.
         96 klatek zaczyna wyglądać jak kilkaset — bez dobierania plików.
         Mieszamy tylko, gdy obie klatki są dokładnie te, o które chodzi;
         przy niedoczytanych zastępnikach dałoby to podwójną ekspozycję. */
      var blend = (a === i0 && frac > 0.01 && ready[i1] && i1 !== i0);
      var key = blend ? i0 + ':' + Math.round(frac * 100) : 'x' + a;
      if (key !== lastKey) {
        paint(images[a]);
        if (blend) {
          ctx.globalAlpha = frac;
          paint(images[i1]);
          ctx.globalAlpha = 1;
        }
        lastKey = key;
      }
    }

    for (var i = 0; i < beats.length; i++) {
      var o = fade(p, BEATS[i]);
      var el = beats[i];
      el.style.opacity = o;
      el.style.transform = 'translate3d(0,' + ((1 - o) * 26).toFixed(2) + 'px,0)';
      el.classList.toggle('is-live', o > 0.9);
    }

    if (hint) hint.classList.toggle('is-gone', p > 0.03);
    if (loader && p > 0.03) loader.classList.add('is-done');
    if (hint && p > 0.03) hint.classList.remove('is-ready');
  }

  function draw() { measure(); shown = rawProgress(); lastKey = ''; render(shown); }

  /* ---------- pętla: scroll ciągnie, obraz dopływa ---------- */
  /* Kółko myszy przewija skokowo (~100 px na "klik"), więc numer klatki
     przeskakiwałby o dwie–trzy naraz. Zamiast renderować pozycję scrolla
     wprost, gonimy ją z tłumieniem — skok zamienia się w płynny dojazd. */
  var shown = 0;          /* to, co widać */
  var wanted = 0;         /* to, gdzie jest scroll */
  var running = false;
  var prevTs = 0;
  var SMOOTHING = reduced ? 1 : 0.16;   /* 1 = bez tłumienia */

  function tick(ts) {
    var dt = prevTs ? Math.min(64, ts - prevTs) : 16.7;
    prevTs = ts;

    var diff = wanted - shown;
    if (Math.abs(diff) < 0.0002) {
      shown = wanted;
      render(shown);
      running = false;
      prevTs = 0;
      return;
    }
    /* Współczynnik zależny od czasu klatki, żeby tempo dojazdu było takie samo
       na ekranie 60 Hz i 120 Hz. */
    shown += diff * (1 - Math.pow(1 - SMOOTHING, dt / 16.7));
    render(shown);
    requestAnimationFrame(tick);
  }

  function start() {
    if (running) return;
    running = true;
    prevTs = 0;
    requestAnimationFrame(tick);
  }

  function onScroll() {
    wanted = rawProgress();
    if (reduced) { shown = wanted; render(shown); return; }
    start();
  }

  /* ---------- awaryjnie: samo wideo ---------- */
  function useVideo() {
    if (!fallback) return;
    fallback.src = 'assets/video/hero.mp4';
    fallback.setAttribute('poster', 'assets/img/poster.jpg');
    sticky.classList.add('is-video');
    if (loader) loader.classList.add('is-done');
    if (reduced) { fallback.play().catch(function () {}); return; }
    fallback.addEventListener('loadedmetadata', function () {
      window.addEventListener('scroll', function () {
        var d = fallback.duration || 8;
        fallback.currentTime = Math.min(d - 0.05, rawProgress() * d);
      }, { passive: true });
    });
  }

  /* ---------- start ---------- */
  sizeCanvas();
  measure();
  wanted = shown = rawProgress();
  load(0);
  preload();
  render(shown);

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { sizeCanvas(); draw(); }, { passive: true });

  /* Powrót do zakładki: requestAnimationFrame nie działa, gdy karta jest ukryta,
     więc po odzyskaniu widoczności wymuszamy jedno przerysowanie. */
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) { draw(); }
  });
  window.addEventListener('pageshow', function () { draw(); });
  window.addEventListener('orientationchange', function () { setTimeout(function () { sizeCanvas(); draw(); }, 200); });

  /* Jeśli po 6 s nie udało się wczytać ani jednej klatki — pokaż wideo. */
  setTimeout(function () { if (loaded === 0) useVideo(); }, 6000);

  /* ---------- nawigacja ---------- */
  if (nav) {
    var stick = function () { nav.classList.toggle('is-stuck', window.scrollY > 40); };
    stick();
    window.addEventListener('scroll', stick, { passive: true });
  }
})();
