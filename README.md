# In Their Own Hand

MEMO's campaign pitch for OCMG, built as a single scrolling page.

## Run it locally

```bash
npm install
npm run dev
```

Then open the address it prints (usually http://localhost:5173).

## Presenting

- Scroll freely; let go more than 70% of the way to the next resting point and the page settles on it.
- ↓ / PageDown / Space: next step. ↑ / PageUp: previous. Home / End: first / last.
- On slide 5, ← → switch cars.

## Publishing

```bash
npm run deploy
```

Builds the site and pushes it to the `gh-pages` branch, which GitHub Pages serves at
https://enzelin0.github.io/in-their-own-hand/

## Editing

- Text and slides: `index.html`
- Styles: `src/style.css`
- Scroll choreography and resting points: `src/lib/`
- Video and car images: `public/media/`
