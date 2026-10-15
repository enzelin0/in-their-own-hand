export function initMarquee() {
  document.querySelectorAll('[data-marquee]').forEach((m) => {
    const track = m.querySelector('.marquee__track');
    [...track.children].forEach((c) => {
      const clone = c.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.append(clone);
    });
    const measure = () => m.style.setProperty('--marquee-dur', (track.scrollWidth / 2 / 40).toFixed(2) + 's');
    measure();
    document.fonts.ready.then(measure);
    let t;
    addEventListener('resize', () => { clearTimeout(t); t = setTimeout(measure, 150); });
  });
}
