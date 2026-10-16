import { gsap, ScrollTrigger, SplitText, reduced } from './gsap.js';
import { setVar, setClass } from './vars.js';

const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// Plays a timeline when its element arrives on screen and rewinds it when you scroll back above,
// so it is always finished by the time a presenter stop settles.
const onArrive = (el, tl, start = 'top 85%') => ScrollTrigger.create({
  trigger: el, start,
  onEnter: () => tl.play(),
  onLeaveBack: () => tl.reverse(),
});

// When a jump skips several slides, everything already scrolled past appears at once;
// only what is on screen gets the staggered entrance.
const split = (batch) => {
  const now = [];
  const passed = [];
  batch.forEach((el) => (el.getBoundingClientRect().bottom < 0 ? passed : now).push(el));
  return [now, passed];
};

// Everything on the content slides appears through blur and settles with expo-out;
// anything scroll-driven tracks the finger 1:1.
export function initReveals() {
  if (reduced) {
    $$('[data-lines-in]').forEach((el) => setVar(el, '--in', 1));
    gsap.set('[data-rise], [data-fade]', { autoAlpha: 1 });
    return;
  }

  // Statements: lines rise out of their masks.
  $$('[data-lines-in]').forEach((el) => {
    ScrollTrigger.create({
      trigger: el, start: 'top 82%',
      onEnter: () => gsap.to(el, { '--in': 1, duration: 1.5, ease: 'outExpo', overwrite: true }),
      onLeaveBack: () => gsap.to(el, { '--in': 0, duration: 0.5, ease: 'magic', overwrite: true }),
    });
  });

  // Cards rise from the bottom one after another.
  const hidden = { y: 56, autoAlpha: 0, scale: 0.96, filter: 'blur(8px)', transformOrigin: '50% 100%' };
  gsap.set('[data-rise]', hidden);
  ScrollTrigger.batch('[data-rise]', {
    start: 'top 92%',
    onEnter: (b) => {
      const [now, passed] = split(b);
      gsap.set(passed, { y: 0, autoAlpha: 1, scale: 1, clearProps: 'filter', overwrite: true });
      gsap.to(now, { y: 0, autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: 0.95, ease: 'outExpo', stagger: 0.07, overwrite: true, onComplete: () => gsap.set(now, { clearProps: 'filter' }) });
    },
    onLeaveBack: (b) => gsap.to(b, { ...hidden, duration: 0.4, ease: 'magic', stagger: 0.03, overwrite: true }),
  });

  // Small things fade up.
  gsap.set('[data-fade]', { y: 16, autoAlpha: 0, filter: 'blur(6px)' });
  ScrollTrigger.batch('[data-fade]', {
    start: 'top 90%',
    onEnter: (b) => {
      const [now, passed] = split(b);
      gsap.set(passed, { y: 0, autoAlpha: 1, filter: 'blur(0px)', overwrite: true });
      gsap.to(now, { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 0.9, ease: 'outExpo', stagger: 0.08, overwrite: true });
    },
    onLeaveBack: (b) => gsap.to(b, { y: 16, autoAlpha: 0, filter: 'blur(6px)', duration: 0.35, ease: 'magic', overwrite: true }),
  });

  // Numbers count up in tabular figures.
  $$('[data-count]').forEach((el) => {
    const to = parseFloat(el.dataset.count);
    const dec = +(el.dataset.dec || 0);
    const o = { v: 0 };
    const render = () => { el.textContent = o.v.toFixed(dec); };
    render();
    ScrollTrigger.create({
      trigger: el, start: 'top 90%',
      onEnter: () => gsap.to(o, { v: to, duration: 1.8, ease: 'expoOut', onUpdate: render, overwrite: true }),
      onLeaveBack: () => gsap.to(o, { v: 0, duration: 0.3, onUpdate: render, overwrite: true }),
    });
  });

  // Closing lines reveal word by word as you scroll.
  document.fonts.ready.then(() => requestAnimationFrame(() => {
    $$('[data-reveal-words]').forEach((el) => {
      const split = SplitText.create(el, { type: 'words', wordsClass: 'word', propIndex: true });
      setVar(el, '--n', split.words.length);
      ScrollTrigger.create({
        trigger: el, start: 'top 88%', end: 'top 45%',
        onUpdate: (s) => { setVar(el, '--p', s.progress); setClass(el, 'is-words', s.progress > 0 && s.progress < 1); },
      });
    });
    ScrollTrigger.refresh();
  }));

  // Bars grow from the left once their card is in.
  $$('[data-grow]').forEach((el, i, all) => {
    // Budget bars grow one row after another; paired bars elsewhere follow each other.
    const row = el.closest('.bars__row');
    const order = row ? [...row.parentElement.children].indexOf(row) * 0.05 : all.filter((s) => s.parentElement === el.parentElement).indexOf(el) * 0.08;
    gsap.fromTo(el, { scaleX: 0 }, {
      scaleX: 1, duration: 1.3, ease: 'outExpo', delay: 0.25 + order,
      scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none reverse' },
    });
  });

  // The budget brace draws after the bar.
  const brace = document.querySelector('[data-brace]');
  if (brace) {
    gsap.fromTo(brace, { '--brace': 0, autoAlpha: 0 }, {
      '--brace': 1, autoAlpha: 1, duration: 1, ease: 'outExpo', delay: 0.7,
      scrollTrigger: { trigger: brace, start: 'top 92%', toggleActions: 'play none none reverse' },
    });
  }

  // Timeline bars draw week by week once the chart arrives.
  const gantt = document.querySelector('[data-gantt]');
  if (gantt) {
    const rows = gantt.querySelectorAll('.gantt__row i');
    const col = gantt.querySelector('.gantt__col');
    gsap.set(rows, { scaleX: 0 });
    gsap.set(col, { scaleY: 0, transformOrigin: '50% 0%' });
    const tl = gsap.timeline({ paused: true })
      .to(col, { scaleY: 1, duration: 1, ease: 'outExpo' }, 0.2)
      .to(rows, { scaleX: 1, duration: 0.9, ease: 'outExpo', stagger: 0.08 }, 0.3);
    onArrive(gantt, tl);
  }

  // The kit lands as a stack, then fans open.
  const kit = document.querySelector('[data-kit]');
  if (kit) {
    const cards = kit.querySelectorAll('[data-kit-card]');
    const fan = [
      { xPercent: -72, rotate: -9, y: 16 },
      { xPercent: -24, rotate: -3, y: -2 },
      { xPercent: 24, rotate: 3, y: -2 },
      { xPercent: 72, rotate: 9, y: 16 },
    ];
    gsap.set(cards, { autoAlpha: 0, y: 60, rotate: 0, xPercent: 0, filter: 'blur(8px)' });
    const tl = gsap.timeline({ paused: true });
    cards.forEach((c, i) => {
      tl.to(c, { autoAlpha: 1, y: fan[i].y, filter: 'blur(0px)', duration: 0.7, ease: 'outExpo' }, i * 0.08)
        .to(c, { xPercent: fan[i].xPercent, rotate: fan[i].rotate, duration: 1.1, ease: 'expoOut' }, 0.55);
    });
    onArrive(kit, tl);
  }

  // The notification arrives after the dashboard.
  const toast = document.querySelector('[data-toast]');
  if (toast) {
    gsap.set(toast, { autoAlpha: 0, x: 40, scale: 0.96, filter: 'blur(8px)' });
    ScrollTrigger.create({
      trigger: toast, start: 'top 95%',
      onEnter: () => gsap.to(toast, { autoAlpha: 1, x: 0, scale: 1, filter: 'blur(0px)', duration: 1, delay: 0.6, ease: 'outExpo', overwrite: true }),
      onLeaveBack: () => gsap.to(toast, { autoAlpha: 0, x: 40, scale: 0.96, filter: 'blur(8px)', duration: 0.3, overwrite: true }),
    });
  }

  // The journey line fills; each step lights up as it is reached.
  const journey = document.querySelector('[data-journey]');
  if (journey) {
    const fill = journey.querySelector('[data-journey-fill]');
    const steps = [...journey.querySelectorAll('[data-step]')];
    const p = { v: 0 };
    const tl = gsap.timeline({ paused: true }).to(p, {
      v: 1, duration: 1.8, ease: 'power2.inOut', delay: 0.3,
      onUpdate: () => {
        gsap.set(fill, { scaleX: p.v });
        steps.forEach((st, i) => setClass(st, 'is-on', p.v > 0 && p.v >= i / (steps.length - 1) - 0.001));
      },
    });
    onArrive(journey, tl);
  }

  // Test vs control: 35 dots each, one per ten households.
  $$('[data-dots]').forEach((d, gi) => {
    d.innerHTML = '<i></i>'.repeat(35);
    const dots = d.children;
    gsap.fromTo(dots, { scale: 0.2, autoAlpha: 0 }, {
      scale: 1, autoAlpha: 1, duration: 0.5, ease: 'outExpo', stagger: { each: 0.012 }, delay: gi * 0.25,
      scrollTrigger: { trigger: d, start: 'top 92%', toggleActions: 'play none none reverse' },
    });
  });

  // The zero lands out of a blur.
  const zero = document.querySelector('[data-zero] .zero__n');
  if (zero) {
    const tl = gsap.timeline({ paused: true }).fromTo(zero,
      { scale: 0.8, autoAlpha: 0, filter: 'blur(24px)', transformOrigin: '0% 100%' },
      { scale: 1, autoAlpha: 1, filter: 'blur(0px)', duration: 1.4, ease: 'outExpo', delay: 0.4 });
    onArrive(zero, tl);
  }

  initApproval();
}

function initApproval() {
  const card = document.querySelector('[data-approve]');
  const sig = card.querySelector('[data-sig]');
  const len = sig.getTotalLength();
  gsap.set(sig, { strokeDasharray: len, strokeDashoffset: len });
  // The signature writes itself on the line once the card has settled.
  const draw = gsap.timeline({ paused: true }).to(sig, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut', delay: 0.6 });
  onArrive(card, draw, 'top 80%');
}
