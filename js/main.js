/* ============================================================
   AI Linqs  main.js
   - ハンバーガーメニュー開閉
   - スクロールでヘッダー切替
   - スクロールリビール（IntersectionObserver）
   - ヒーロー背景の軽いパララックス
   依存なし（バニラJS）
   ============================================================ */
(function () {
  'use strict';

  /* ---- LINE公式 友だち追加URLを全CTAに反映 ---- */
  var LINE_URL = 'https://lin.ee/XFEkgJS';
  document.querySelectorAll('[data-line-cta]').forEach(function (a) {
    a.setAttribute('href', LINE_URL);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener');
  });

  var hamburger = document.getElementById('hamburger');
  var gnav = document.getElementById('gnav');
  var header = document.getElementById('header');

  /* ---- ハンバーガー ---- */
  function closeMenu() {
    if (!gnav || !hamburger) return;
    gnav.classList.remove('is-open');
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'メニューを開く');
  }
  function toggleMenu() {
    if (!gnav || !hamburger) return;
    var open = gnav.classList.toggle('is-open');
    hamburger.classList.toggle('is-open', open);
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    hamburger.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
  }
  if (hamburger && gnav) {
    hamburger.addEventListener('click', toggleMenu);
    gnav.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
    window.addEventListener('resize', function () { if (window.innerWidth >= 900) closeMenu(); });
  }

  /* ---- ヘッダー切替（ヒーローを抜けたら） ---- */
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 60); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- スクロールリビール ---- */
  var reveals = document.querySelectorAll('.reveal');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---- 背景“世界”：見せ場(interlude)に同期して4シーンをクロスフェード＋スクロールズーム ---- */
  var world = document.getElementById('world');
  var scenes = Array.prototype.slice.call(document.querySelectorAll('.scene'));
  if (scenes.length) {
    var clamp01 = function (v) { return v < 0 ? 0 : (v > 1 ? 1 : v); };

    // 各シーンの「ピークになるスクロール位置(px)」を要素から算出
    var centers = [];
    var docH = 1;
    var calc = function () {
      var vh = window.innerHeight;
      docH = Math.max(1, document.documentElement.scrollHeight - vh);
      centers = scenes.map(function (sc, i) {
        if (i === 0) return 0;                                  // シーン1はページ最上部でピーク
        var el = document.getElementById(sc.getAttribute('data-anchor'));
        if (!el) return docH;
        var top = el.getBoundingClientRect().top + window.scrollY;
        return top + el.offsetHeight / 2 - vh / 2;              // 見せ場が画面中央に来る位置
      });
    };
    calc();
    window.addEventListener('resize', calc);
    window.addEventListener('load', calc);

    var last = scenes.length - 1;
    var ticking = false;
    var update = function () {
      var y = window.scrollY;
      var fade = window.innerHeight * 0.72;                     // クロスフェードの幅(px)
      for (var i = 0; i < scenes.length; i++) {
        var o;
        if (i === 0 && y <= centers[i]) o = 1;
        else if (i === last && y >= centers[i]) o = 1;
        else o = clamp01(1 - Math.abs(y - centers[i]) / fade);
        scenes[i].style.opacity = o.toFixed(3);
      }
      // 世界全体をスクロールで少しずつズーム（動きを強調）
      if (world) {
        var p = clamp01(y / docH);
        world.style.transform = 'scale(' + (1 + p * 0.14).toFixed(3) + ')';
      }
    };
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { update(); ticking = false; });
    }, { passive: true });
    update();
  }
})();
