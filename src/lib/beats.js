import { isMobile } from './gsap.js';

export const N = 5;

const DESKTOP = {
  hold: 60, aboutExit: 50, letterRun: 510, catRun: 110, tail: 0,
  videoEnd: 1.6, heroOutTitle: 0.25, heroOutUi: 0.18, g1: 0.7, pol: [0.12, 0.22], aboutIn: [0.35, 1],
};
const MOBILE = { ...DESKTOP, hold: 40, aboutExit: 40, videoEnd: 1.4 };

export const beats = () => (isMobile() ? MOBILE : DESKTOP);

export function applyBeats() {
  const b = beats();
  const s = document.documentElement.style;
  s.setProperty('--hold', b.hold + 'svh');
  s.setProperty('--about-exit', b.aboutExit + 'svh');
  s.setProperty('--letter-run', b.letterRun + 'svh');
  s.setProperty('--cat-run', `calc(${b.catRun}svh + 0svh + ${b.tail}svh)`);
}
