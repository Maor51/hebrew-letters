# AlefBet v2 — Main Menu, Image Proportions, Multi-Image Design

## Goal

Add a main menu screen that separates launch from study, fix oversized images in the letter view, and support multiple images per letter displayed in a single horizontal row.

## Architecture

Three self-contained changes to the existing Vite + React 19 + React Router v6 app. No new dependencies. Routes restructure: `/` becomes `MainMenu`, `/play` becomes `AlphabetGrid`. `LetterView` and `NavBar` get minor updates.

## Tech Stack

Vite, React 19, React Router v6, Tailwind CSS v3, existing `ProgressContext` for visited-letter state.

---

## Feature 1 — Main Menu Screen

### Route changes

| Route | Before | After |
|---|---|---|
| `/` | AlphabetGrid | MainMenu |
| `/play` | (none) | AlphabetGrid |
| `/letter/:id` | LetterView | LetterView (unchanged) |

### New component: `src/components/MainMenu.jsx`

Layout (top to bottom, centered, cream background `#FFF5E6`):

1. **Title** — "רום לומד את אותיות ה-א, ב" — large, orange (`#FF8C69`), bold, serif
2. **Decorative letters** — "א ב ג ד" — smaller, brown (`#8B7355`), bold, letter-spacing
3. **Play button** — pill shape, gradient `#FFB347 → #FF8C69`, white text "התחל", large touch target (min 56px height), navigates to `/play`
4. **Progress dots** — one dot per letter (22 total), filled = visited (color `#FFB347`), unfilled = not yet visited (color `#E0D8CC`), with text "X / 22 אותיות" in brown below

### NavBar update

`src/components/NavBar.jsx`: change the 🏠 `navigate` target from `"/"` to `"/play"` so it returns to the grid (not the main menu) during a study session.

### App.jsx update

Add `MainMenu` import and route. Move `AlphabetGrid` route from `/` to `/play`.

---

## Feature 2 — Fix Image Proportions

### Problem

`LetterView` currently sets `minHeight: '200px'` on the image container, making images render unproportionally large.

### Fix

- Remove `minHeight` constraint
- Use `object-fit: contain` on `<img>` elements
- Cap images with `max-height: 200px` so they're readable but not overwhelming
- Width: `100%` within flex container so they fill naturally

---

## Feature 3 — Multiple Images Per Letter

### Data schema change

`src/data/letters.json`: rename `imagePath: string` → `imagePaths: string[]` for every entry.

Naming convention for image files: `<transliteration><number>.png` (e.g. `alef1.png`, `alef2.png`, `alef3.png`). Letters with a single image use a one-element array: `["./images/alef1.png"]`.

### LetterView update

Replace single `<img>` with a flex row of images:

```jsx
<div style={{ display: 'flex', gap: '10px' }}>
  {letter.imagePaths.map((src, i) => (
    <img key={i} src={src} alt="" style={{ flex: 1, height: '160px', objectFit: 'contain', borderRadius: '12px' }} />
  ))}
</div>
```

- All images share the row width equally (`flex: 1`)
- Fixed height (160px) so the row is consistent regardless of image count
- `object-fit: contain` preserves proportions

### Backward compatibility

No backward compat needed — all entries in `letters.json` will be updated to the new `imagePaths` array format in the same task.

---

## Testing

- `MainMenu` renders title, decorative letters, play button, and progress dots
- Clicking "התחל" navigates to `/play`
- Progress dots reflect visited letters from `ProgressContext`
- `LetterView` renders all images in `imagePaths` in a row
- Single image renders correctly (one-element array)
- NavBar 🏠 navigates to `/play`

---

## Out of Scope

- Audio playback
- Settings screen
- Resetting progress from the main menu
