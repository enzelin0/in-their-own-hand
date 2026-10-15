import { gsap, ScrollTrigger, reduced } from './gsap.js';
import { setVar, setClass } from './vars.js';

export function initHero({ header, beats, ready }) {
  const hero = document.querySelector('[data-hero]');
  const title = hero.querySelector('[data-hero-title]');
  const ui = [...hero.querySelectorAll('[data-hero-ui]')];
  const ghost = header.el.querySelector('.header__ghost');

  // "In Their" starts under the header's ghost item; "Own Hand" sits on the right margin.
  const placeTitle = () => {
    const r = ghost.getBoundingClientRect();
    if (r.width > 0) hero.style.setProperty('--title-left', Math.round(r.left) + 'px');
    else hero.style.removeProperty('--title-left');
  };
  placeTitle();
  document.fonts.ready.then(placeTitle);
  ScrollTrigger.addEventListener('refreshInit', placeTitle);

  const st = { title: { in: 0, out: 0 }, ui: ui.map(() => ({ in: 0, out: 0 })) };
  const partial = (v) => v > 0 && v < 1;
  const applyTitle = () => {
    setVar(title, '--in', st.title.in);
    setVar(title, '--out', st.title.out);
    setClass(title, 'is-anim', partial(st.title.in) || partial(st.title.out));
  };
  const applyUi = (i) => {
    setVar(ui[i], '--in', st.ui[i].in);
    setVar(ui[i], '--out', st.ui[i].out);
    setClass(ui[i], 'is-anim', partial(st.ui[i].in));
  };
  const applyAll = () => { applyTitle(); ui.forEach((_, i) => applyUi(i)); };
  const show = () => gsap.set([header.el, hero], { visibility: 'visible' });

  let started = false;
  function buildExit() {
    ScrollTrigger.create({
      trigger: hero, start: 'top top', end: () => '+=' + beats().heroOutTitle * innerHeight,
      onUpdate: (s) => { st.title.out = s.progress; applyTitle(); },
    });
    ScrollTrigger.create({
      trigger: hero, start: 'top top', end: () => '+=' + beats().heroOutUi * innerHeight,
      onUpdate: (s) => { st.ui.forEach((u, i) => { u.out = s.progress; applyUi(i); }); },
    });
  }

  function start() {
    if (started) return;
    started = true;
    if (reduced) {
      st.title.in = 1;
      st.ui.forEach((u) => { u.in = 1; });
      applyAll(); show(); buildExit();
      return;
    }
    applyAll();
    setClass(title, 'is-anim', true);
    ui.forEach((el) => setClass(el, 'is-anim', true));
    header.playIntro();
    const tl = gsap.timeline({ onComplete: applyAll });
    tl.to(st.title, { in: 1, duration: 1.4, ease: 'outExpo', onUpdate: applyTitle }, 0.15);
    ui.forEach((_, i) => tl.to(st.ui[i], { in: 1, duration: 0.9, ease: 'expoOut', onUpdate: () => applyUi(i) }, 0.45 + i * 0.09));
    show();
    buildExit();
  }

  Promise.all([document.fonts.ready, ready]).then(() => requestAnimationFrame(start));

  const failsafe = () => {
    if (started) return;
    if (document.hidden) { setTimeout(failsafe, 4000); return; }
    start();
  };
  setTimeout(failsafe, 4000);
}
