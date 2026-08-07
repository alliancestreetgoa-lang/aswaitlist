import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

// Exponential ease-out everywhere — no bounce, no elastic.
const EASE = 'power4.out';
const EASE_SOFT = 'power3.out';

const splits = [];

const q = (sel) => gsap.utils.toArray(sel);

/* ------------------------------------------------------------------ *
 * Reduced motion: skip every animation, but land on the final state.
 * ------------------------------------------------------------------ */
function setCounterFinal(el) {
  const target = parseFloat(el.dataset.count);
  el.textContent = target + (el.dataset.suffix || '');
}

function releaseAntiFlash() {
  document.documentElement.classList.remove('js-anim');
}

function applyReducedMotionState() {
  releaseAntiFlash();
  const all = [
    '.reveal', '.reveal-group > *', '.split-head',
    '.hero-badge', '.hero-title', '.hero-rule', '.hero-copy', '.hero-checks',
    '.hero-stat', '.hero-form', '.cover-item', '.host-portrait', '.host-copy > *',
    '.js-why-cards > *', '.js-testimonials > *', '.js-credstats > *', '.js-faq > *',
    '.book-icon', '.book-cta',
  ].flatMap(q);
  if (all.length) gsap.set(all, { opacity: 1, clearProps: 'transform,clipPath' });
  q('.stat-number').forEach(setCounterFinal);
}

/* ------------------------------------------------------------------ *
 * Shared: masked line-by-line reveal for the big display headings.
 * ------------------------------------------------------------------ */
function maskedHeading(el, opts = {}) {
  const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'js-line' });
  splits.push(split);
  gsap.from(split.lines, {
    yPercent: 115,
    duration: 1,
    ease: EASE,
    stagger: 0.09,
    scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    ...opts,
  });
  return split;
}

/* ------------------------------------------------------------------ *
 * Global chrome: scroll progress bar + header condense
 * ------------------------------------------------------------------ */
function globalChrome() {
  const bar = document.querySelector('.asc-progress');
  if (bar) {
    gsap.fromTo(bar, { scaleX: 0 }, {
      scaleX: 1,
      ease: 'none',
      transformOrigin: 'left center',
      scrollTrigger: { start: 0, end: () => document.body.scrollHeight - window.innerHeight, scrub: 0.3 },
    });
  }

  // Condense the header on scroll using compositor-safe properties only
  // (no padding change — the header is in flow and would shift the page).
  const header = document.querySelector('header');
  const mark = document.querySelector('.asc-logo-mark');
  if (header) {
    const tl = gsap.timeline({
      scrollTrigger: { start: 40, end: 140, scrub: 0.4 },
    });
    tl.to(header, { backgroundColor: 'rgba(10,10,10,0.98)', ease: 'none' }, 0);
    if (mark) tl.to(mark, { scale: 0.88, transformOrigin: 'left center', ease: 'none' }, 0);
  }
}

/* ------------------------------------------------------------------ *
 * Hero — parallax photo, masked headline, staggered supporting cast,
 * and a slow drift-out as the section leaves.
 * ------------------------------------------------------------------ */
function heroScene() {
  const hero = document.querySelector('#top');
  if (!hero) return;

  // Photo drifts slower than the page (the layer is over-sized top/bottom).
  const bg = hero.querySelector('.asc-hero-bg');
  if (bg) {
    gsap.fromTo(bg, { yPercent: -6, scale: 1.08 }, {
      yPercent: 6,
      scale: 1.14,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6 },
    });
  }

  const intro = gsap.timeline({ defaults: { ease: EASE } });

  intro.from('.hero-badge', { opacity: 0, scale: 0.9, y: 14, duration: 0.7 }, 0);

  const title = document.querySelector('.hero-title');
  if (title) {
    const split = SplitText.create(title, { type: 'lines', mask: 'lines', linesClass: 'js-line' });
    splits.push(split);
    intro.from(split.lines, { yPercent: 115, duration: 1.1, stagger: 0.1 }, 0.12);
  }

  intro.from('.hero-rule', { scaleX: 0, transformOrigin: 'left center', duration: 0.7 }, 0.5);
  intro.from('.hero-copy', { opacity: 0, y: 20, duration: 0.8, stagger: 0.1 }, 0.55);
  intro.from('.hero-checks > *', { opacity: 0, y: 14, scale: 0.94, duration: 0.6, stagger: 0.07 }, 0.75);
  intro.from('.hero-stat', { opacity: 0, y: 24, duration: 0.8 }, 0.85);
  intro.from('.hero-form', { opacity: 0, y: 34, duration: 1 }, 0.25);

  // Content drifts up and fades as the hero scrolls away.
  gsap.to('.asc-hero-grid', {
    yPercent: -8,
    opacity: 0.25,
    ease: 'none',
    scrollTrigger: { trigger: hero, start: 'center center', end: 'bottom top', scrub: 0.5 },
  });

  // Stat count-ups fire with the hero intro rather than on scroll.
  q('.stat-number').forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const counter = { val: 0 };
    intro.to(counter, {
      val: target,
      duration: 1.4,
      ease: EASE_SOFT,
      onUpdate: () => { el.textContent = Math.round(counter.val) + suffix; },
    }, 0.95);
  });
}

/* ------------------------------------------------------------------ *
 * Why — cards tip up from a slight 3D recline.
 * ------------------------------------------------------------------ */
function whyScene() {
  const grid = document.querySelector('.js-why-cards');
  if (!grid) return;
  gsap.from(grid.children, {
    opacity: 0,
    y: 56,
    rotateX: -12,
    transformPerspective: 900,
    transformOrigin: 'center bottom',
    duration: 1,
    ease: EASE,
    stagger: 0.12,
    scrollTrigger: { trigger: grid, start: 'top 85%', once: true },
  });
}

/* ------------------------------------------------------------------ *
 * Cover — rows converge from alternating sides.
 * ------------------------------------------------------------------ */
function coverScene() {
  const items = q('.cover-item');
  if (!items.length) return;
  items.forEach((el, i) => {
    gsap.from(el, {
      opacity: 0,
      x: i % 2 === 0 ? -60 : 60,
      duration: 1,
      ease: EASE,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  const glow = document.querySelector('.cover-glow');
  if (glow) {
    gsap.fromTo(glow, { opacity: 0.35, scale: 0.9 }, {
      opacity: 1, scale: 1.15, ease: 'none',
      scrollTrigger: { trigger: '#cover', start: 'top bottom', end: 'bottom top', scrub: 0.6 },
    });
  }
}

/* ------------------------------------------------------------------ *
 * Host — portrait unmasks from the bottom while the photo settles;
 * the copy column arrives from the side.
 * ------------------------------------------------------------------ */
function hostScene() {
  const portrait = document.querySelector('.host-portrait');
  if (portrait) {
    gsap.from(portrait, {
      clipPath: 'inset(100% 0% 0% 0%)',
      duration: 1.3,
      ease: EASE,
      scrollTrigger: { trigger: portrait, start: 'top 85%', once: true },
    });
    const img = portrait.querySelector('img');
    if (img) {
      gsap.fromTo(img, { scale: 1.24 }, {
        scale: 1,
        duration: 1.6,
        ease: EASE,
        // Hand transform back to CSS so the :hover zoom isn't blocked by
        // GSAP's inline style.
        clearProps: 'transform',
        scrollTrigger: { trigger: portrait, start: 'top 85%', once: true },
      });
    }
  }

  const copy = document.querySelector('.host-copy');
  if (copy) {
    gsap.from(copy.children, {
      opacity: 0,
      x: 40,
      duration: 0.9,
      ease: EASE,
      stagger: 0.08,
      scrollTrigger: { trigger: copy, start: 'top 85%', once: true },
    });
  }
}

/* ------------------------------------------------------------------ *
 * Credibility — quote cards rise and settle out of a slight scale.
 * ------------------------------------------------------------------ */
function credibilityScene() {
  [['.js-testimonials', 0.13], ['.js-credstats', 0.1]].forEach(([sel, stagger]) => {
    const grid = document.querySelector(sel);
    if (!grid) return;
    gsap.from(grid.children, {
      opacity: 0,
      y: 60,
      scale: 0.94,
      duration: 1,
      ease: EASE,
      stagger,
      scrollTrigger: { trigger: grid, start: 'top 86%', once: true },
    });
  });
}

/* ------------------------------------------------------------------ *
 * FAQ — rows wipe in from the divider line downward.
 * ------------------------------------------------------------------ */
function faqScene() {
  const list = document.querySelector('.js-faq');
  if (!list) return;
  gsap.from(list.children, {
    opacity: 0,
    y: 26,
    duration: 0.7,
    ease: EASE_SOFT,
    stagger: 0.07,
    scrollTrigger: { trigger: list, start: 'top 85%', once: true },
  });
}

/* ------------------------------------------------------------------ *
 * Book — the closing CTA lands with weight.
 * ------------------------------------------------------------------ */
function bookScene() {
  const icon = document.querySelector('.book-icon');
  if (icon) {
    gsap.from(icon, {
      opacity: 0, scale: 0.4, rotate: -35, duration: 0.9, ease: EASE,
      scrollTrigger: { trigger: '#book', start: 'top 80%', once: true },
    });
  }
  const cta = document.querySelector('.book-cta');
  if (cta) {
    gsap.from(cta.children, {
      opacity: 0, y: 22, scale: 0.95, duration: 0.7, ease: EASE, stagger: 0.1,
      scrollTrigger: { trigger: cta, start: 'top 92%', once: true },
    });
  }
  const glow = document.querySelector('.book-glow');
  if (glow) {
    gsap.fromTo(glow, { opacity: 0.4, scale: 0.85 }, {
      opacity: 1, scale: 1.2, ease: 'none',
      scrollTrigger: { trigger: '#book', start: 'top bottom', end: 'bottom top', scrub: 0.6 },
    });
  }
}

/* ------------------------------------------------------------------ *
 * Every card: pointer-tracked 3D tilt + lift. User-driven only — no idle
 * loop, so nothing wobbles on its own. Skipped entirely on touch/coarse
 * pointers, where a tilt would fire on tap and just feel broken.
 * ------------------------------------------------------------------ */
const cardTeardowns = [];

function cardInteractions() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  // The form is excluded on purpose: tilting a field you're typing into is
  // hostile, and it's the page's conversion surface.
  const cards = q('.asc-card, .asc-glass-card').filter((c) => !c.closest('.asc-form-card'));
  const rectResets = [];

  cards.forEach((card) => {
    gsap.set(card, { transformPerspective: 1000, transformOrigin: 'center center' });

    const opts = { duration: 0.55, ease: 'power3.out' };
    const rotX = gsap.quickTo(card, 'rotationX', opts);
    const rotY = gsap.quickTo(card, 'rotationY', opts);
    const moveY = gsap.quickTo(card, 'y', opts);
    const scale = gsap.quickTo(card, 'scale', opts);

    // Cached on enter so pointermove never forces a layout read.
    let rect = null;
    const MAX_TILT = 7;

    const onEnter = () => {
      rect = card.getBoundingClientRect();
      moveY(-8);
      scale(1.02);
    };
    const onMove = (e) => {
      if (!rect) rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      rotY(px * MAX_TILT * 2);
      rotX(-py * MAX_TILT * 2);
    };
    const onLeave = () => {
      rect = null;
      rotX(0); rotY(0); moveY(0); scale(1);
    };

    rectResets.push(() => { rect = null; });

    card.addEventListener('pointerenter', onEnter);
    card.addEventListener('pointermove', onMove);
    card.addEventListener('pointerleave', onLeave);

    cardTeardowns.push(() => {
      card.removeEventListener('pointerenter', onEnter);
      card.removeEventListener('pointermove', onMove);
      card.removeEventListener('pointerleave', onLeave);
    });
  });

  // Scrolling moves every card, so cached rects go stale. Drop them and let
  // the next pointermove recompute — cheaper than reading layout per move.
  const dropRects = () => { rectResets.forEach((fn) => fn()); };
  window.addEventListener('scroll', dropRects, { passive: true });
  window.addEventListener('resize', dropRects);
  cardTeardowns.push(() => {
    window.removeEventListener('scroll', dropRects);
    window.removeEventListener('resize', dropRects);
  });
}

/* ------------------------------------------------------------------ *
 * Generic fallbacks for anything not given a bespoke treatment.
 * ------------------------------------------------------------------ */
function genericReveals() {
  q('.reveal').forEach((el) => {
    gsap.from(el, {
      opacity: 0, y: 26, duration: 0.8, ease: EASE_SOFT, clearProps: 'transform',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  q('.reveal-group').forEach((group) => {
    gsap.from(group.children, {
      opacity: 0, y: 30, duration: 0.75, ease: EASE_SOFT, stagger: 0.08, clearProps: 'transform',
      scrollTrigger: { trigger: group, start: 'top 88%', once: true },
    });
  });

  q('.split-head').forEach((el) => maskedHeading(el));
}

function buildAll() {
  try {
    globalChrome();
    heroScene();
    whyScene();
    coverScene();
    hostScene();
    credibilityScene();
    faqScene();
    bookScene();
    genericReveals();
    cardInteractions();
    ScrollTrigger.refresh();
  } finally {
    // Always unhide, even if a scene threw — a blank hero is worse than
    // a missing animation.
    releaseAntiFlash();
  }
}

/**
 * Sets up every scroll animation. Returns a cleanup function.
 */
export function runScrollAnimations() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    applyReducedMotionState();
    return () => {};
  }

  // SplitText measures line breaks, so the webfonts (Anton/Barlow) must be
  // resolved first or the masked headings split on the fallback metrics.
  // Race a timeout so a font failure can never leave the page unanimated.
  let cancelled = false;
  const start = () => { if (!cancelled) buildAll(); };

  if (document.fonts && document.fonts.ready) {
    Promise.race([
      document.fonts.ready,
      new Promise((res) => setTimeout(res, 1200)),
    ]).then(start);
  } else {
    start();
  }

  return () => {
    cancelled = true;
    ScrollTrigger.getAll().forEach((t) => t.kill());
    splits.forEach((s) => s.revert());
    splits.length = 0;
    cardTeardowns.forEach((fn) => fn());
    cardTeardowns.length = 0;
  };
}
