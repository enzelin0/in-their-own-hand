import { setVar } from './vars.js';

export function setPol(v) {
  document.querySelectorAll('.pol').forEach((el) => setVar(el, '--pol', v));
}
