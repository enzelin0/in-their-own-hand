import { SplitText, reduced } from './gsap.js';
import { setVar, setClass } from './vars.js';

// A centred statement that reveals word by word from blur, then lifts out.
export function initWords(el) {
  let p = 0;
  let out = 0;
  if (!reduced) setClass(el, 'is-hidden', true);

  document.fonts.ready.then(() => requestAnimationFrame(() => {
    const split = SplitText.create(el, { type: 'words', wordsClass: 'word', propIndex: true, autoSplit: false });
    setVar(el, '--n', split.words.length);
    apply();
  }));

  function apply() {
    setVar(el, '--p', p);
    setVar(el, '--out', out);
    setClass(el, 'is-words', p > 0 && p < 1);
    setClass(el, 'is-anim', out > 0 && out < 1);
    if (!reduced) setClass(el, 'is-hidden', p <= 0 || out >= 1);
  }

  return {
    setP: (v) => { p = v; apply(); },
    setOut: (v) => { out = v; apply(); },
  };
}
