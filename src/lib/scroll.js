import LocomotiveScroll from 'locomotive-scroll';
import { gsap, ScrollTrigger } from './gsap.js';

let instance;
let resolveAnchor = () => null;

// nav.js can map an anchor id to a choreographed resting position.
export const setAnchorResolver = (fn) => { resolveAnchor = fn; };

export function glideTo(hash) {
  const y = resolveAnchor(hash.slice(1));
  instance.scrollTo(y ?? hash, { duration: 2 });
}

export function initScroll() {
  instance = new LocomotiveScroll({
    lenisOptions: { lerp: 0.07, wheelMultiplier: 0.85, touchMultiplier: 1.3, syncTouch: false },
    initCustomTicker: (r) => gsap.ticker.add(r),
    destroyCustomTicker: (r) => gsap.ticker.remove(r),
  });
  history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  instance.lenisInstance.on('scroll', ScrollTrigger.update);
  gsap.ticker.lagSmoothing(0);

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href*="#"]');
    if (!a || a.origin !== location.origin || a.pathname !== location.pathname) return;
    const id = a.hash.slice(1);
    if (!id || !document.getElementById(id)) return;
    e.preventDefault();
    glideTo(a.hash);
  });
  if (location.hash && document.getElementById(location.hash.slice(1))) {
    requestAnimationFrame(() => glideTo(location.hash));
  }
  return instance;
}

export const getScroll = () => instance;
