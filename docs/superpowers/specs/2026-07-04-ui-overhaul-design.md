# AlefBet UI Overhaul Design

## Goal

Restyle the AlefBet Hebrew alphabet app to match a premium, modern kids'-app aesthetic: playful gradient background, vibrant 3D-tactile letter cards, a glassmorphism letter view, and smooth Framer Motion animations throughout.

## Architecture

Approach A — style in place. Every component's logic, routing, and test surface stays unchanged. Only class names, inline styles, and JSX structure are updated. Framer Motion wrappers (`motion.div`, `motion.button`, `AnimatePresence`) are layered on top of existing elements. One new dependency: `framer-motion`.

## Tech Stack

Vite, React 19, Tailwind CSS v3, Framer Motion, Google Fonts (Rubik).

---

## 1. Global Styles

### Font

Replace `Frank Ruhl Libre` with **Rubik** (400 / 700 / 800 / 900 weights).

`index.html` — swap the `<link>` tags:
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;700;800;900&display=swap" rel="stylesheet" />
```

`tailwind.config.js` — update font family:
```js
fontFamily: {
  sans: ['Rubik', 'sans-serif'],
  hebrew: ['Rubik', 'sans-serif'],
}
```

### Background

Every full-screen container (`min-h-screen`) gets:
```
background: linear-gradient(160deg, #e0f2fe 0%, #f0fdf4 50%, #fef9c3 100%)
```

Replace `background: '#FFF5E6'` everywhere with this gradient (inline style — Tailwind arbitrary values are unwieldy for three-stop gradients).

---

## 2. Letter Card (`LetterCard.jsx`)

### Card Colors — 5-color cycle

Each card uses one of 5 vibrant gradient pairs, cycling by index `i % 5`:

| Index | From | To | Name |
|---|---|---|---|
| 0 | `#fb923c` | `#f97316` | Peach |
| 1 | `#34d399` | `#10b981` | Mint |
| 2 | `#a78bfa` | `#8b5cf6` | Lavender |
| 3 | `#f472b6` | `#ec4899` | Pink |
| 4 | `#38bdf8` | `#0ea5e9` | Sky |

The `color` field in `letters.json` is kept as-is (no data migration) but is no longer read by any component. The card component derives its color from its position index, passed in as a prop from `AlphabetGrid`.

### Card Shape & Depth

```
border-radius: 20px
box-shadow: 0 4px 12px rgba(0,0,0,0.10)
border-bottom: 4px solid rgba(0,0,0,0.14)   ← 3D raised effect
padding: 10px 4px 8px
min-height: 84px
```

### Typography

- Letter glyph: `font-size: 44px`, `font-weight: 900`, `color: white`, `text-shadow: 0 2px 6px rgba(0,0,0,0.18)`
- Word label: `font-size: 10px`, `font-weight: 700`, `color: rgba(255,255,255,0.88)`
- Visited star: `position: absolute`, top-right corner, `font-size: 13px`, `filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2))`

### Framer Motion — tap press

Wrap the `<button>` with `motion.button`:

```jsx
<motion.button
  whileTap={{ y: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderBottomWidth: '1px' }}
  whileHover={{ y: -2, boxShadow: '0 8px 20px rgba(0,0,0,0.14)' }}
  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
>
```

---

## 3. Alphabet Grid (`AlphabetGrid.jsx`)

### Background & Header

- Background: gradient (section 1)
- Title `אָלֶף-בֵּית ✨`: Rubik 900, `color: #1e293b`, `font-size: 22px`
- Progress bar: `background: #e2e8f0` track, `background: linear-gradient(90deg, #fb923c, #fbbf24)` fill, `height: 8px`, `border-radius: 99px`
- Progress text: `font-size: 12px`, `color: #64748b`, Rubik 600

### Staggered Entry Animation

Wrap the grid container with a Framer Motion parent and each card with a child variant:

```jsx
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
}
const cardVariants = {
  hidden: { opacity: 0, scale: 0.6 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 18 } },
}

<motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-4 gap-[9px]">
  {letters.map((letter, i) => (
    <motion.div key={letter.id} variants={cardVariants}>
      <LetterCard letter={letter} index={i} isVisited={isVisited(letter.id)} onClick={...} />
    </motion.div>
  ))}
</motion.div>
```

`LetterCard` receives `index` prop to derive card color.

---

## 4. Letter View (`LetterView.jsx`)

### Layout Change — remove full-width banner

Replace the full-width gradient banner (the letter + audio block) with a floating **glassmorphism card** containing the letter, word, and images.

New layout (top to bottom):
1. Back pill button (NavBar, restyled)
2. Glassmorphism card:
   - Big letter (tappable → plays audio)
   - Small `🔊 הקש לשמוע` hint
   - Word text
   - Image row (existing flex row)
3. Navigation row (prev/next)

### Glassmorphism Card Style

```
background: rgba(255,255,255,0.82)
backdrop-filter: blur(16px)
border-radius: 28px
border: 1.5px solid rgba(255,255,255,0.75)
box-shadow: 0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.05)
padding: 28px 20px 22px
```

### Big Letter

```
font-size: 130px
font-weight: 900
```

Color: use the same 5-color cycle as cards — `CARD_COLORS[letters.findIndex(l => l.id === id) % 5].from` where `CARD_COLORS` is the same constant defined in a shared `src/constants/cardColors.js` file.

The existing `GRADIENT_END` object and `letter.color` usage in `LetterView.jsx` are removed.

### AnimatePresence — page transitions

Wrap the card content with `AnimatePresence` + `motion.div` keyed to `id`:

```jsx
<AnimatePresence mode="wait">
  <motion.div
    key={id}
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -24 }}
    transition={{ duration: 0.22, ease: 'easeOut' }}
  >
    {/* glassmorphism card content */}
  </motion.div>
</AnimatePresence>
```

---

## 5. NavBar (`NavBar.jsx`)

### Home Button

Replace orange square button with a white pill:
```
background: white
border-radius: 50px
padding: 9px 20px
font-weight: 700, font-size: 13px, color: #475569
box-shadow: 0 2px 8px rgba(0,0,0,0.10), 0 2px 0 rgba(0,0,0,0.07)
border-bottom: 3px solid rgba(0,0,0,0.08)
```

### Next Button

Same white pill, circular (52×52px), orange arrow `←`, matching depth shadow.

### NavBar Background

Remove `background: '#FFE0B2'` — use `background: transparent` so the gradient background shows through. Add gentle `backdrop-filter: blur(8px)` for readability.

---

## 6. Main Menu (`MainMenu.jsx`)

Restyle in-place — layout unchanged, styles updated:

- Background: gradient (section 1)
- Title "רום לומד את אותיות ה-א, ב": Rubik 900, `color: #f97316`, `font-size: 28-32px`
- Decorative "א ב ג ד": Rubik 700, `color: #475569`, `letter-spacing: 10px`, `font-size: 20px`
- "התחל" button: `background: linear-gradient(135deg, #fb923c, #f97316)`, pill shape, `border-bottom: 4px solid rgba(0,0,0,0.12)`, `box-shadow: 0 6px 20px rgba(249,115,22,0.4)`
- Progress dots: visited = `#fb923c`, unvisited = `#cbd5e1` (updated from `#E0D8CC`)

Wrap the "התחל" button with `motion.button` press/hover (same spring as cards).

---

## 7. Shared Color Constant

Create `src/constants/cardColors.js` — a single source of truth for the 5-color cycle used by both `LetterCard` and `LetterView`:

```js
export const CARD_COLORS = [
  { from: '#fb923c', to: '#f97316' }, // Peach
  { from: '#34d399', to: '#10b981' }, // Mint
  { from: '#a78bfa', to: '#8b5cf6' }, // Lavender
  { from: '#f472b6', to: '#ec4899' }, // Pink
  { from: '#38bdf8', to: '#0ea5e9' }, // Sky
]
```

Both components import this and compute `CARD_COLORS[index % 5]`.

---

## 8. Dependency

Add `framer-motion` to `dependencies`:
```
npm install framer-motion
```

---

## 8. Testing Strategy

Existing 41 tests remain unchanged — they test routing, rendering, progress state, and data schema. None assert on class names or inline styles, so the style overhaul does not break them.

Framer Motion animations are bypassed in jsdom (no layout engine), so `motion.*` components render their children normally in tests. No mocking needed.

---

## Out of Scope

- Audio improvements
- New letter content
- Settings screen
- PWA / offline support
