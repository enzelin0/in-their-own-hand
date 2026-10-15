import { gsap, ScrollTrigger, reduced } from './gsap.js';

export function initCatalog({ fleet }) {
  const cars = JSON.parse(document.getElementById('cars').textContent);
  const root = document.querySelector('[data-widgets]');
  const q = (s) => root.querySelector(s);
  const els = { name: q('[data-w-name]'), desc: q('[data-w-desc]'), loc: q('[data-w-loc]'), price: q('[data-w-price]') };
  const texts = [els.name, els.desc, els.loc, els.price];

  function fill(i) {
    const c = cars[i];
    els.name.textContent = c.name;
    els.desc.textContent = c.desc;
    els.loc.textContent = c.location;
    els.price.textContent = c.owners;
  }

  let pending = 0;
  let swapTl;
  function swap(i) {
    if (i === pending) return;
    pending = i;
    if (reduced) { fill(i); return; }
    swapTl?.kill();
    swapTl = gsap.timeline({ defaults: { ease: 'magic', overwrite: true } })
      .to(texts, { autoAlpha: 0, y: '-.4em', duration: 0.25, stagger: 0.03 })
      .call(() => fill(i))
      .fromTo(texts, { autoAlpha: 0, y: '.4em' }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.04, clearProps: 'transform,opacity,visibility' });
  }

  function reset(i = 0) {
    swapTl?.kill();
    gsap.set(texts, { clearProps: 'transform,opacity,visibility' });
    fill(i);
    pending = i;
  }

  fill(0);
  if (reduced) return { swap, reset };

  const widgets = root.querySelectorAll('.widget');
  const enter = gsap.timeline({ paused: true }).fromTo(widgets,
    { y: 56, autoAlpha: 0, scale: 0.96, transformOrigin: '50% 100%' },
    { y: 0, autoAlpha: 1, scale: 1, duration: 0.85, ease: 'outExpo', stagger: 0.07 });
  const at = () => { const f = fleet.facts(); return f.yB + 1.85 * f.H; };
  ScrollTrigger.create({
    start: at, end: () => at() + 1,
    onEnter: () => enter.play(), onLeaveBack: () => enter.reverse(),
  });

  return { swap, reset };
}
