import { ScrollTrigger, reduced } from './gsap.js';
import { setVar, setClass, pageTop } from './vars.js';

// A sticky screen whose items rise in as it arrives and lift out with blur before it leaves.
export function initPinned(section) {
  const items = [...section.querySelectorAll('[data-about-in]')];
  const statement = section.querySelector('.about__statement');
  if (reduced) { items.forEach((el) => setVar(el, '--in', 1)); return; }

  const H = () => innerHeight;
  const yA = () => pageTop(section);
  const yAe = () => yA() + section.offsetHeight - H();

  ScrollTrigger.create({
    start: () => yA() - (1 - 0.35) * H(), end: () => yA(),
    onUpdate: (s) => items.forEach((el) => setVar(el, '--in', s.progress)),
  });
  ScrollTrigger.create({
    start: () => yAe() - 0.5 * H(), end: () => yAe() - 0.1 * H(),
    onUpdate: (s) => {
      items.forEach((el) => setVar(el, '--out', s.progress));
      if (statement) setClass(statement, 'is-anim', s.progress > 0 && s.progress < 1);
    },
  });
}
