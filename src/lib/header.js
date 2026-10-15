import { gsap, reduced } from './gsap.js';

export function initHeader() {
  const header = document.querySelector('[data-header]');
  const items = header.querySelectorAll('[data-header-item]');
  const now = header.querySelector('[data-now]');
  const menu = header.querySelector('[data-menu]');

  function playIntro() {
    if (reduced) return;
    gsap.fromTo(items, { y: '1em', autoAlpha: 0 }, {
      y: 0, autoAlpha: 1, duration: 0.6, ease: 'magic', stagger: 0.08, clearProps: 'transform,opacity,visibility',
    });
  }

  // The ghost item shows which slide is on screen and who presents it.
  let label = now.textContent;
  function setNow(text) {
    if (text === label) return;
    label = text;
    if (reduced) { now.textContent = text; return; }
    gsap.timeline({ defaults: { ease: 'magic', overwrite: true } })
      .to(now, { y: '-.5em', autoAlpha: 0, filter: 'blur(4px)', duration: 0.2 })
      .add(() => { now.textContent = label; })
      .fromTo(now, { y: '.5em', autoAlpha: 0, filter: 'blur(4px)' }, { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 0.45, clearProps: 'filter' });
  }

  // The act the current slide belongs to is shown in full ink.
  const acts = [...header.querySelectorAll('[data-act]')];
  function setAct(name) {
    acts.forEach((a) => a.classList.toggle('is-current', a.dataset.act === name));
  }

  menu.addEventListener('click', () => {
    const open = header.classList.toggle('is-open');
    menu.setAttribute('aria-expanded', open);
    menu.querySelector('.bi').className = `bi ${open ? 'bi-x-lg' : 'bi-list'}`;
  });
  header.querySelectorAll('.header__nav a').forEach((a) => a.addEventListener('click', () => {
    if (header.classList.contains('is-open')) menu.click();
  }));

  return { el: header, playIntro, setNow, setAct };
}
