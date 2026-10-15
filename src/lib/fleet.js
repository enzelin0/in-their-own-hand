import { gsap, ScrollTrigger, reduced } from './gsap.js';
import { setVar, setClass, clamp01, pageTop } from './vars.js';
import { N } from './beats.js';
import { initWords } from './words.js';

// Stage 2: five cars blur in under the slide-5 intro, rise over a statement,
// the centre car zooms to full width and becomes a carousel.
export function initFleet() {
  const stage = document.querySelector('[data-fleet-stage]');
  const row = stage.querySelector('[data-fleet-row]');
  const cars = [...row.querySelectorAll('.car')];
  const buildEl = stage.querySelector('[data-build]');
  const catalog = stage.querySelector('[data-catalog]');
  const words = initWords(stage.querySelector('[data-words="fleet"]'));
  const easeIO = gsap.parseEase('power2.inOut');
  const state = { cur: 0, wind: 0, zoom: 0, rin: 0 };
  let tl;

  function facts() {
    const H = innerHeight;
    const yI = pageTop(buildEl);
    const yB = yI + buildEl.offsetHeight - H; // intro has lifted out
    const yC = pageTop(catalog);
    const yCe = yC + catalog.offsetHeight - H;
    return { H, yI, yB, yC, yCe };
  }

  function setCur(cur) {
    state.cur = cur;
    const eff = cur * state.wind;
    cars.forEach((car, i) => {
      let d = i - eff;
      d -= N * Math.round(d / N);
      const ad = Math.abs(d);
      const vis = 1 - state.zoom * clamp01((ad - 0.5) / 0.4);
      setVar(car, '--d', d);
      setVar(car, '--dir', ad < 0.001 ? 0 : Math.sign(d));
      setVar(car, '--vis', vis);
      setClass(car, 'is-anim', vis > 0 && vis < 1);
      car.style.zIndex = 10 - Math.round(ad);
      setClass(car, 'is-hidden', vis <= 0 || state.rin <= 0);
    });
  }

  function build() {
    tl?.scrollTrigger?.kill();
    tl?.kill();
    const f = facts();
    const H = f.H;
    if (reduced) {
      Object.assign(state, { rin: 1, wind: 1, zoom: 1 });
      setVar(row, '--rin', 1); setVar(row, '--par', 1); setVar(row, '--zoom', 1);
      words.setP(1);
      setCur(state.cur);
      return;
    }
    tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { start: 0, end: () => facts().yCe, scrub: true, invalidateOnRefresh: true },
    });
    const leg = (pos, dur, fn) => {
      const o = { v: 0 };
      tl.to(o, { v: 1, duration: dur, onUpdate: () => fn(o.v) }, Math.max(0, pos));
    };
    leg(f.yI - 0.1 * H, 0.6 * H, (v) => {
      state.rin = v;
      setVar(row, '--rin', v);
      setClass(row, 'is-anim', v > 0 && v < 1);
      setCur(state.cur);
    });
    leg(f.yB, 1.4 * H, (v) => setVar(row, '--par', v));
    leg(f.yB, 1.0 * H, (v) => words.setP(v));
    // The statement holds fully revealed for a beat (a presenter stop sits at yB + 1.02H).
    leg(f.yB + 1.1 * H, 0.35 * H, (v) => words.setOut(v));
    leg(f.yB + 1.1 * H, 0.95 * H, (v) => { state.wind = easeIO(v); setCur(state.cur); });
    leg(f.yB + 1.25 * H, 0.8 * H, (v) => {
      state.zoom = easeIO(v);
      setVar(row, '--zoom', state.zoom);
      setCur(state.cur);
    });
    tl.to({}, { duration: 0.001 }, f.yCe);
  }

  // The carousel only listens while the presented car is actually on screen.
  const active = () => {
    const f = facts();
    return state.zoom >= 0.99 && scrollY > f.yB + 1.5 * f.H && scrollY < f.yCe + 0.4 * f.H;
  };

  ScrollTrigger.addEventListener('refreshInit', build);
  setCur(0);
  build();
  return { state, cars, N, setCur, facts, active };
}
