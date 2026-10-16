// Speaker notes: press N to show the script for the slide on screen. For rehearsal; if the
// laptop mirrors to the projector, the audience sees the panel too.
export function initNotes() {
  const data = JSON.parse(document.getElementById('notes').textContent);
  const panel = document.createElement('aside');
  panel.className = 'notes';
  panel.hidden = true;
  panel.setAttribute('aria-label', 'Speaker notes');
  panel.setAttribute('data-lenis-prevent', '');
  const head = document.createElement('div');
  head.className = 'notes__head';
  const title = document.createElement('b');
  title.className = 't-ui';
  const hint = document.createElement('span');
  hint.className = 't-caption notes__hint';
  hint.textContent = 'N to close';
  head.append(title, hint);
  const body = document.createElement('div');
  body.className = 'notes__body t-body-sm';
  panel.append(head, body);
  document.body.append(panel);

  let current = '01';
  const render = () => {
    const n = data[current];
    title.textContent = n ? `${current} · ${n.speaker} — ${n.title}` : current;
    body.replaceChildren(...(n ? n.script : ['No script for this page.']).map((line) => {
      const p = document.createElement('p');
      p.textContent = line;
      if (/^\[.*\]$/.test(line)) p.className = 'notes__cue';
      return p;
    }));
    body.scrollTop = 0;
  };

  addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() !== 'n' || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.closest('input, textarea, [contenteditable]')) return;
    panel.hidden = !panel.hidden;
    if (!panel.hidden) render();
  });

  return {
    setSlide(slide) {
      if (slide === current) return;
      current = slide;
      if (!panel.hidden) render();
    },
  };
}
