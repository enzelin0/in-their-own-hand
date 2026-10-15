import { gsap, ScrollTrigger, reduced } from './gsap.js';

// Arrows and ← → keys move the presented car around the ring.
export function initSlider({ fleet, onChange, onReset }) {
  const state = { idx: 0, cur: 0 };
  const N = fleet.N;
  let tween;

  // idx is unbounded: the ring wraps visually, the widgets show idx mod N.
  function go(idx) {
    if (idx === state.idx) return;
    state.idx = idx;
    onChange(((idx % N) + N) % N);
    if (reduced) { state.cur = idx; fleet.setCur(idx); return; }
    tween = gsap.to(state, { cur: idx, duration: 1.6, ease: 'magic', overwrite: true, onUpdate: () => fleet.setCur(state.cur) });
  }
  function step(dir) {
    if (fleet.state.zoom < 0.99) return;
    go(state.idx + dir);
  }

  document.querySelector('[data-prev]').addEventListener('click', () => step(-1));
  document.querySelector('[data-next]').addEventListener('click', () => step(1));
  addEventListener('keydown', (e) => {
    if (e.altKey || e.metaKey || e.ctrlKey || !fleet.active()) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  });

  const at = () => { const f = fleet.facts(); return f.yB + 1.0 * f.H; };
  ScrollTrigger.create({
    start: at, end: () => at() + 1, invalidateOnRefresh: true,
    onLeaveBack: () => {
      tween?.kill();
      state.idx = 0;
      state.cur = 0;
      fleet.setCur(0);
      onReset();
    },
  });

  return { state, step };
}
