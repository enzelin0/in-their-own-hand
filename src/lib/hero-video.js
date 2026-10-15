import { reduced } from './gsap.js';

// Scrubs the hero video by seeking; requests that arrive mid-seek are coalesced.
export function initHeroVideo() {
  const video = document.querySelector('[data-hero-video]');
  let pending = null;
  let seeking = false;

  function applyNext() {
    if (pending === null) { seeking = false; return; }
    const t = pending;
    pending = null;
    if (Math.abs(video.currentTime - t) < 0.01) { seeking = false; return; }
    seeking = true;
    video.currentTime = t;
  }
  video.addEventListener('seeked', applyNext);

  function scrub(p01) {
    if (reduced || !video.duration || video.readyState < 1) return;
    if (!video.paused) video.pause();
    const d = video.duration;
    const target = Math.min(d - 0.001, Math.max(0, p01 * d));
    if (!seeking && Math.abs(video.currentTime - target) < 0.03) return;
    pending = target;
    if (!seeking) applyNext();
  }

  const ready = new Promise((resolve) => {
    let done = false;
    const finish = () => { if (!done) { done = true; resolve(); } };
    const onMeta = () => { video.pause(); video.currentTime = 0.001; };
    const warm = () => {
      // Decode one frame ahead so the first scrub doesn't stall.
      const once = () => {
        video.removeEventListener('seeked', once);
        video.currentTime = 0.001;
        finish();
      };
      video.addEventListener('seeked', once);
      video.currentTime = Math.min(0.12, video.duration * 0.03);
    };
    if (video.readyState >= 1) onMeta(); else video.addEventListener('loadedmetadata', onMeta, { once: true });
    if (video.readyState >= 3) warm(); else video.addEventListener('canplay', warm, { once: true });
    video.addEventListener('error', finish, { once: true });
    setTimeout(finish, 4000);
  });

  return { scrub, ready, video };
}
