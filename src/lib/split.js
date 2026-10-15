import { SplitText, ScrollTrigger } from './gsap.js';

export function initSplit() {
  let queued = false;
  const refresh = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; ScrollTrigger.refresh(); });
  };
  return document.fonts.ready.then(() => new Promise((resolve) => requestAnimationFrame(() => {
    document.querySelectorAll('[data-split]').forEach((el) => {
      new SplitText(el, {
        tag: 'span', type: 'lines', mask: 'lines',
        linesClass: 'line', wordsClass: 'word', charsClass: 'char',
        propIndex: true, autoSplit: true, onSplit: refresh,
      });
    });
    resolve();
  })));
}
