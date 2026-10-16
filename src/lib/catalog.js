import { gsap, ScrollTrigger, reduced } from './gsap.js';

// The four Build → Letter → Drive → Meet cards rise in once the presented car has zoomed.
export function initCatalog({ fleet }) {
  const noop = { swap() {}, reset() {} };
  if (reduced) return noop;

  const widgets = document.querySelectorAll('[data-widgets] .widget');
  const enter = gsap.timeline({ paused: true }).fromTo(widgets,
    { y: 56, autoAlpha: 0, scale: 0.96, transformOrigin: '50% 100%' },
    { y: 0, autoAlpha: 1, scale: 1, duration: 0.85, ease: 'outExpo', stagger: 0.07 });
  const at = () => { const f = fleet.facts(); return f.yB + 1.85 * f.H; };
  ScrollTrigger.create({
    start: at, end: () => at() + 1,
    onEnter: () => enter.play(), onLeaveBack: () => enter.reverse(),
  });
  return noop;
}
