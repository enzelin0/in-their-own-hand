export const clamp01 = (v) => Math.min(1, Math.max(0, v));

// Write a custom property only when its rounded value changes.
export function setVar(el, name, v, unit = '') {
  const s = (+v).toFixed(3) + unit;
  const memo = el.__vars || (el.__vars = {});
  if (memo[name] === s) return;
  memo[name] = s;
  el.style.setProperty(name, s);
}

export function setClass(el, cls, on) {
  const memo = el.__cls || (el.__cls = {});
  on = !!on;
  if (memo[cls] === on) return;
  memo[cls] = on;
  el.classList.toggle(cls, on);
}

// Absolute page Y of an element, independent of offsetParent.
export function pageTop(el) {
  let y = 0;
  for (let n = el; n; n = n.offsetParent) y += n.offsetTop;
  return y;
}
