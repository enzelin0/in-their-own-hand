import { ScrollTrigger } from './gsap.js';
import { pageTop } from './vars.js';
import { getScroll, setAnchorResolver } from './scroll.js';

// Presenter navigation. The page has resting points ("stops") placed where every reveal on
// screen has finished. Keys glide to the next one; free scrolling is pulled onto one once you
// are most of the way there.
export function initNav({ header, media, fleet, notes }) {
  const H = () => innerHeight;
  const q = (s) => document.querySelector(s);
  const maxY = () => document.documentElement.scrollHeight - H();
  const centreOn = (el) => pageTop(el) + el.offsetHeight / 2 - H() / 2;

  // A slide rests with its header near the top. If its content runs past the fold, extra
  // rests walk down it; the closing line gets its own rest, centred, once it has fully revealed.
  const slideStops = (el) => {
    const head = el.querySelector('.slide__head, .slide__meta') || el;
    const centre = pageTop(el) + (el.offsetHeight - H()) / 2;
    let first = Math.max(pageTop(el), Math.min(centre, pageTop(head) - 0.17 * H()));
    const words = el.querySelector('[data-reveal-words]');
    const content = [...el.children].filter((c) => c !== words && !c.classList.contains('ask__thanks'));
    const last = Math.max(...content.map((c) => pageTop(c) + c.offsetHeight)) + 0.06 * H() - H();
    // Slightly too tall: settle a little lower instead of adding a tiny extra step.
    if (last > first && last - first <= 0.12 * H()) first = Math.min(last, pageTop(head) - 0.1 * H());
    const ys = [first];
    for (let y = first + 0.75 * H(); y < last - 0.1 * H(); y += 0.75 * H()) ys.push(y);
    if (last > first + 0.08 * H()) ys.push(last);
    // A closing line gets its own rest only when it sits further down than the slide's first rest.
    if (words && centreOn(words) > first + 0.1 * H()) ys.push(centreOn(words));
    return ys;
  };

  const named = {
    top: () => 0,
    about: () => media.facts().yA + 0.3 * H(),
    letter: () => media.facts().yL + 0.15 * H(),
    reading: () => media.facts().yL + 1.85 * H(),
    line: () => media.facts().yL + 3.0 * H(),
    build: () => pageTop(q('[data-build]')) + 0.3 * H(),
    fleetWords: () => { const f = fleet.facts(); return f.yB + 1.02 * f.H; },
    catalog: () => fleet.facts().yCe,
    ask: () => centreOn(q('[data-approve]')),
  };

  const stops = () => {
    const ys = [named.top(), named.about(), named.letter(), named.reading(), named.line()];
    document.querySelectorAll('.slide').forEach((el) => {
      ys.push(...slideStops(el));
      if (el.dataset.slide === '04') ys.push(named.build(), named.fleetWords(), named.catalog());
    });
    ys.push(maxY());
    const sorted = ys.map((y) => Math.min(Math.max(0, Math.round(y)), maxY())).sort((a, b) => a - b);
    return sorted.filter((y, i) => i === 0 || y - sorted[i - 1] > 80);
  };

  setAnchorResolver((id) => {
    if (named[id]) return Math.min(named[id](), maxY());
    const el = document.getElementById(id);
    return el?.classList.contains('slide') ? slideStops(el)[0] : null;
  });

  // Glides take longer the further they travel, so the choreography in between stays legible.
  // Any wheel or touch input interrupts a glide.
  const lenis = getScroll().lenisInstance;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  let heading = null;
  let busyUntil = 0;
  const glide = (y, duration = Math.min(2.6, Math.max(1.1, 0.9 + (0.45 * Math.abs(y - scrollY)) / H()))) => {
    heading = y;
    busyUntil = performance.now() + duration * 1000;
    lenis.scrollTo(y, { duration, easing: ease, force: true });
  };
  // Key presses during a glide count from where the glide is heading, not where it is.
  const step = (dir) => {
    const y = performance.now() < busyUntil + 100 && heading !== null ? heading : scrollY;
    const list = stops();
    const target = dir > 0 ? list.find((s) => s > y + 8) : [...list].reverse().find((s) => s < y - 8);
    if (target !== undefined) glide(target);
  };

  addEventListener('keydown', (e) => {
    if (e.altKey || e.metaKey || e.ctrlKey) return;
    if (e.key === ' ' && e.target instanceof Element && e.target.closest('button, a, input, textarea')) return;
    const carousel = fleet.active();
    const fwd = ['ArrowDown', 'PageDown', ' '].includes(e.key) || (e.key === 'ArrowRight' && !carousel);
    const back = ['ArrowUp', 'PageUp'].includes(e.key) || (e.key === 'ArrowLeft' && !carousel);
    if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); glide(e.key === 'Home' ? 0 : maxY()); return; }
    if (!fwd && !back) return;
    e.preventDefault();
    step(fwd ? 1 : -1);
  });

  // Free scrolling with a magnet: when scrolling comes to rest more than 70% of the way from one
  // resting point to the next (in the direction you were going), the page settles on it.
  // Below 70% it stays exactly where you left it. Phones scroll freely without the magnet.
  const SNAP = 0.7;
  let lastY = scrollY;
  let dir = 0;
  let idle;
  const settle = () => {
    if (innerWidth < 768 || performance.now() < busyUntil) return;
    const y = scrollY;
    const list = stops();
    const i = list.findIndex((s) => s > y + 2);
    if (i <= 0) return;
    const a = list[i - 1];
    const b = list[i];
    if (y - a < 2) return;
    const p = (y - a) / (b - a);
    const target = dir > 0 && p >= SNAP ? b : dir < 0 && p <= 1 - SNAP ? a : null;
    if (target !== null) glide(target, Math.min(1.4, Math.max(0.6, 0.5 + (0.8 * Math.abs(target - y)) / H())));
  };
  // Your own wheel or touch input takes over from any glide in progress.
  const takeOver = () => { busyUntil = 0; heading = null; };
  addEventListener('wheel', takeOver, { passive: true });
  addEventListener('touchstart', takeOver, { passive: true });
  lenis.on('scroll', () => {
    const y = scrollY;
    if (Math.abs(y - lastY) > 0.5) dir = Math.sign(y - lastY);
    lastY = y;
    clearTimeout(idle);
    idle = setTimeout(settle, 140);
  });

  // Story acts: the letter (1), the gap (2–4), the idea (5–7), the plan (8–11); 12 is the ask.
  const actOf = (n) => (n <= 1 ? 'letter' : n <= 4 ? 'gap' : n <= 7 ? 'idea' : n <= 11 ? 'plan' : null);

  // The header's ghost item names the slide on screen and its presenter.
  document.querySelectorAll('[data-slide]').forEach((el) => {
    ScrollTrigger.create({
      trigger: el, start: 'top 50%', end: 'bottom 50%',
      onToggle: (s) => {
        if (!s.isActive) return;
        header.setNow(`${el.dataset.slide} · ${el.dataset.speaker}`);
        notes?.setSlide(el.dataset.slide);
        header.setAct(actOf(+el.dataset.slide));
      },
    });
  });
}
