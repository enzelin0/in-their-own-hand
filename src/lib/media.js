import { gsap, ScrollTrigger, reduced } from './gsap.js';
import { setVar, setClass, pageTop } from './vars.js';
import { initWords } from './words.js';

// Stage 1: the hero video shrinks into the about slot, glides to the bottom,
// dissolves into its cut-out, waits under the owner's envelope and letter, then rises and zooms.
export function initMedia({ heroVideo, beats, onPol }) {
  const stage = document.querySelector('[data-stage]');
  const row = stage.querySelector('[data-row]');
  const media = row.querySelector('[data-media]');
  const slot = stage.querySelector('[data-media-slot]');
  const about = stage.querySelector('[data-about]');
  const letter = stage.querySelector('[data-letter]');
  const words = initWords(stage.querySelector('[data-words="letter"]'));
  const owner = initWords(stage.querySelector('[data-words="owner"]'));
  const envelope = stage.querySelector('[data-envelope]');
  const paper = stage.querySelector('[data-letter-paper]');
  const env = { in: 0, open: 0, hide: 0, out: 0 };
  const card = { in: 0, out: 0 };
  const partial = (v) => v > 0 && v < 1;
  const applyEnv = () => {
    setVar(envelope, '--e', env.in);
    setVar(envelope, '--open', env.open);
    setVar(envelope, '--hide', env.hide);
    setVar(envelope, '--out', env.out);
    setClass(envelope, 'is-open', env.open > 0.45);
    setClass(envelope, 'is-anim', partial(env.in) || partial(env.hide) || partial(env.out));
    setClass(envelope, 'is-hidden', env.in <= 0 || env.hide >= 1 || env.out >= 1);
  };
  const applyCard = () => {
    setVar(paper, '--c', card.in);
    setVar(paper, '--co', card.out);
    setClass(paper, 'is-anim', partial(card.in) || partial(card.out));
    setClass(paper, 'is-hidden', card.in <= 0 || card.out >= 1);
  };
  applyEnv();
  applyCard();
  const easeIO = gsap.parseEase('power2.inOut');
  let tl;

  function facts() {
    const H = innerHeight;
    const yA = pageTop(about);
    const yAe = yA + about.offsetHeight - H;
    const yL = pageTop(letter);
    const yLe = yL + letter.offsetHeight - H;
    return { H, yA, yAe, yL, yLe };
  }

  function measure() {
    const W = innerWidth;
    const H = innerHeight;
    const s0 = Math.max(1, H / (0.5625 * W));
    const r = slot.getBoundingClientRect();
    const p = slot.parentElement.getBoundingClientRect();
    const R1 = { x: r.left, y: r.top - p.top, w: r.width, h: r.height };
    const s1 = Math.max(R1.w / W, R1.h / (0.5625 * W));
    const pw = W * s1;
    const ph = 0.5625 * W * s1;
    setVar(media, '--s0', s0);
    media.style.setProperty('--x0', '0px');
    media.style.setProperty('--y0', '0px');
    setVar(media, '--s1', s1);
    setVar(media, '--x1', R1.x + R1.w / 2 - W / 2, 'px');
    setVar(media, '--y1', R1.y + R1.h / 2 - H / 2, 'px');
    setVar(media, '--cx1', ((pw - R1.w) / 2 / pw) * 100, '%');
    setVar(media, '--cy1', ((ph - R1.h) / 2 / ph) * 100, '%');
  }

  function build() {
    tl?.scrollTrigger?.kill();
    tl?.kill();
    measure();
    const f = facts();
    const b = beats();
    const H = f.H;
    if (reduced) {
      Object.assign(env, { in: 1, open: 1, hide: 1 });
      card.in = 1;
      owner.setP(1);
      words.setP(1);
      applyEnv();
      applyCard();
      return;
    }

    tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { start: 0, end: () => facts().yLe, scrub: true, invalidateOnRefresh: true },
    });
    // The timeline's time unit is scroll pixels.
    const leg = (pos, dur, fn) => {
      const o = { v: 0 };
      tl.to(o, { v: 1, duration: dur, onUpdate: () => fn(o.v) }, Math.max(0, pos));
    };
    leg(0, b.videoEnd * H, (v) => heroVideo.scrub(v));
    leg(0, b.g1 * H, (v) => setVar(media, '--g1', easeIO(v)));
    leg(b.pol[0] * H, (b.pol[1] - b.pol[0]) * H, (v) => onPol(v));
    leg(f.yAe - 0.1 * H, 0.5 * H, (v) => setVar(media, '--g2', easeIO(v)));
    leg(f.yAe + 0.4 * H, 0.4 * H, (v) => { setVar(media, '--dis', v); setClass(media, 'is-dissolving', v > 0 && v < 1); });
    // The sealed envelope lands, the seal breaks and the flap opens. The letter comes out and
    // reveals word by word, goes back in, and the closing line appears under the envelope.
    // Presenter stops sit at yL + 0.15H (sealed), 1.85H (the letter) and 3.0H (the line).
    leg(f.yL - 0.45 * H, 0.55 * H, (v) => { env.in = v; applyEnv(); });
    leg(f.yL + 0.25 * H, 0.4 * H, (v) => { env.open = v; applyEnv(); });
    leg(f.yL + 0.55 * H, 0.4 * H, (v) => { card.in = v; env.hide = v; applyCard(); applyEnv(); });
    leg(f.yL + 0.8 * H, 0.95 * H, (v) => owner.setP(v));
    leg(f.yL + 2.0 * H, 0.4 * H, (v) => { card.out = v; env.hide = 1 - v; applyCard(); applyEnv(); });
    // The letter goes back in and the envelope seals again, so the line sits under it as at the start.
    leg(f.yL + 2.1 * H, 0.35 * H, (v) => { env.open = 1 - v; applyEnv(); });
    leg(f.yL + 2.3 * H, 0.6 * H, (v) => words.setP(v));
    leg(f.yL + 3.1 * H, 1.4 * H, (v) => setVar(row, '--par', v));
    leg(f.yL + 3.9 * H, 0.4 * H, (v) => { words.setOut(v); env.out = v; applyEnv(); });
    leg(f.yL + 4.2 * H, 0.8 * H, (v) => setVar(row, '--zoom', easeIO(v)));
    tl.to({}, { duration: 0.001 }, f.yLe);
  }

  ScrollTrigger.addEventListener('refreshInit', build);
  build();
  return { media, facts };
}
