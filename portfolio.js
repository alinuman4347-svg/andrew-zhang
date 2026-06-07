/* Andrew Zhang portfolio — scroll motion & interactions */
(function () {
  "use strict";

  /* ---------- reveal on scroll ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        if (e.target.dataset.once !== "false") io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

  function observeAll() {
    document.querySelectorAll(".reveal, .tl-item").forEach(function (el) {
      io.observe(el);
    });
  }

  /* synchronous fallback: reveal anything already in view (rAF can be throttled) */
  function revealInView() {
    var vh = window.innerHeight;
    document.querySelectorAll(".reveal, .tl-item").forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.92 && r.bottom > 0) el.classList.add("in");
    });
  }

  /* ---------- topbar scrolled state ---------- */
  var topbar = document.querySelector(".topbar");
  function onScrollBar() {
    if (!topbar) return;
    if (window.scrollY > 40) topbar.classList.add("scrolled");
    else topbar.classList.remove("scrolled");
  }

  /* ---------- count up (mission number) ---------- */
  function countUp(el) {
    var target = parseInt(el.dataset.count, 10) || 0;
    var dur = 2200, start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      // easeOutExpo
      var e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = Math.round(target * e).toLocaleString("en-US");
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString("en-US");
    }
    requestAnimationFrame(step);
  }
  var counted = false;
  var countEl = document.querySelector("[data-count]");
  if (countEl) {
    var cio = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (en.isIntersecting && !counted) { counted = true; countUp(countEl); cio.disconnect(); }
      });
    }, { threshold: 0.5 });
    cio.observe(countEl);
  }

  /* ---------- timeline fill ---------- */
  var fill = document.querySelector(".timeline-track .fill");
  var timeline = document.querySelector(".timeline");
  function onScrollTimeline() {
    if (!fill || !timeline) return;
    var r = timeline.getBoundingClientRect();
    var vh = window.innerHeight;
    var startPoint = vh * 0.6;
    var total = r.height + startPoint;
    var prog = (startPoint - r.top) / total;
    prog = Math.max(0, Math.min(1, prog));
    fill.style.height = (prog * 100) + "%";
  }

  /* ---------- hero photo parallax ---------- */
  var heroImg = document.querySelector(".hero-photo-disc img");
  var ghost = document.querySelector(".hero-ghost");
  function onScrollHero() {
    var y = window.scrollY;
    if (heroImg && y < window.innerHeight) {
      heroImg.style.transform = "translateY(" + (y * 0.06) + "px)";
    }
    if (ghost && y < window.innerHeight) {
      ghost.style.transform = "translateX(" + (-y * 0.08) + "px)";
    }
  }

  /* ---------- section progress dot nav ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll("section[data-nav]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".dotnav button"));
  function onScrollNav() {
    var mid = window.scrollY + window.innerHeight * 0.4;
    var current = 0;
    sections.forEach(function (s, i) {
      if (s.offsetTop <= mid) current = i;
    });
    dots.forEach(function (d, i) { d.classList.toggle("active", i === current); });
  }
  dots.forEach(function (d) {
    d.addEventListener("click", function () {
      var id = d.dataset.target;
      var t = document.getElementById(id);
      if (t) window.scrollTo({ top: t.offsetTop - 10, behavior: "smooth" });
    });
  });

  /* ---------- raf scroll loop ---------- */
  var ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(function () {
        onScrollBar(); onScrollTimeline(); onScrollHero(); onScrollNav(); revealInView();
        ticking = false;
      });
      ticking = true;
    }
  }

  function init() {
    observeAll();
    revealInView();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    // hero reveals show immediately
    document.querySelectorAll(".hero .reveal").forEach(function (el) { el.classList.add("in"); });
    // belt-and-suspenders: re-check after layout settles
    setTimeout(revealInView, 120);
    setTimeout(revealInView, 600);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  /* ---------- expose theme setter for tweaks ---------- */
  window.__setTheme = function (t) {
    document.documentElement.setAttribute("data-theme", t || "atlas");
  };
})();
