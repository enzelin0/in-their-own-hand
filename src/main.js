import '@fontsource/inter-tight/latin-400.css';
import '@fontsource/inter-tight/latin-500.css';
import '@fontsource/la-belle-aurore/latin-400.css';
import 'bootstrap-icons/font/bootstrap-icons.min.css';
import './style.css';

import { ScrollTrigger } from './lib/gsap.js';
import { applyBeats, beats } from './lib/beats.js';
import { initScroll } from './lib/scroll.js';
import { initSplit } from './lib/split.js';
import { setPol } from './lib/pol.js';
import { initHeader } from './lib/header.js';
import { initHeroVideo } from './lib/hero-video.js';
import { initHero } from './lib/hero.js';
import { initPinned } from './lib/pinned.js';
import { initMarquee } from './lib/marquee.js';
import { initMedia } from './lib/media.js';
import { initFleet } from './lib/fleet.js';
import { initCatalog } from './lib/catalog.js';
import { initSlider } from './lib/slider.js';
import { initReveals } from './lib/reveals.js';
import { initNav } from './lib/nav.js';
import { initNotes } from './lib/notes.js';

ScrollTrigger.config({ ignoreMobileResize: true });
applyBeats();
initScroll();
initSplit();
const header = initHeader();
const heroVideo = initHeroVideo();
const media = initMedia({ heroVideo, beats, onPol: setPol });
initHero({ header, beats, ready: heroVideo.ready });
initPinned(document.querySelector('[data-about]'));
initPinned(document.querySelector('[data-build]'));
initMarquee();
const fleet = initFleet();
const catalog = initCatalog({ fleet });
initSlider({ fleet, onChange: (i) => catalog.swap(i), onReset: () => catalog.reset(0) });
initReveals();
initNav({ header, media, fleet, notes: initNotes() });

matchMedia('(max-width: 767px)').addEventListener('change', () => { applyBeats(); ScrollTrigger.refresh(); });

// Re-measure once images, the video poster and fonts have settled.
addEventListener('load', () => ScrollTrigger.refresh());
