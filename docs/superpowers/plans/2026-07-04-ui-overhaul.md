# AlefBet UI Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle every screen of the Hebrew alphabet app to a premium kids'-app aesthetic — gradient backgrounds, vibrant 3D letter cards, a glassmorphism letter view, and Framer Motion animations throughout — without touching any routing or business logic.

**Architecture:** Style-in-place: all component logic, routing, and tests stay unchanged; only JSX structure, inline styles, and class names are updated. Framer Motion wrappers (`motion.button`, `motion.div`, `AnimatePresence`) are layered on top of existing elements. One new shared constant (`CARD_COLORS`) and one new dependency (`framer-motion`).

**Tech Stack:** Vite, React 19, Tailwind CSS v3, Framer Motion, Google Fonts (Rubik)

**Design spec:** `docs/superpowers/specs/2026-07-04-ui-overhaul-design.md`

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Create | `src/constants/cardColors.js` | Shared 5-color cycle used by LetterCard and LetterView |
| Modify | `index.html` | Swap Frank Ruhl Libre → Rubik font links |
| Modify | `src/index.css` | Swap body font-family, remove hardcoded background |
| Modify | `tailwind.config.js` | Update fontFamily to Rubik |
| Modify | `src/components/LetterCard.jsx` | 5-color cycle, 3D depth, motion.button |
| Modify | `src/components/AlphabetGrid.jsx` | Gradient bg, pass index prop, stagger animation |
| Modify | `src/components/NavBar.jsx` | Transparent bg, white pill buttons |
| Modify | `src/components/LetterView.jsx` | Glassmorphism card, AnimatePresence, back-pill, big letter color |
| Modify | `src/components/MainMenu.jsx` | Gradient bg, updated title/button/dot styles, motion.button |

---

## Task 1: Install framer-motion + create CARD_COLORS constant

**Files:**
- Create: `src/constants/cardColors.js`
- Modify: `package.json` (via npm install)

- [ ] **Step 1: Install framer-motion**

```bash
npm install framer-motion
```

Expected: `framer-motion` appears under `dependencies` in `package.json`.

- [ ] **Step 2: Create the shared color constant**

Create `src/constants/cardColors.js` with the exact content below:

```js
export const CARD_COLORS = [
  { from: '#fb923c', to: '#f97316' }, // Peach
  { from: '#34d399', to: '#10b981' }, // Mint
  { from: '#a78bfa', to: '#8b5cf6' }, // Lavender
  { from: '#f472b6', to: '#ec4899' }, // Pink
  { from: '#38bdf8', to: '#0ea5e9' }, // Sky
]
```

- [ ] **Step 3: Run all tests to confirm nothing broke**

```bash
npm test -- --run
```

Expected: 41 tests pass, 0 failures.

- [ ] **Step 4: Commit**

```bash
git add src/constants/cardColors.js package.json package-lock.json
git commit -m "feat: add framer-motion and shared CARD_COLORS constant"
```

---

## Task 2: Update global styles

**Files:**
- Modify: `index.html`
- Modify: `src/index.css`
- Modify: `tailwind.config.js`

- [ ] **Step 1: Swap font in index.html**

Replace the three `Frank Ruhl Libre` `<link>` lines in `index.html` with Rubik. The `<head>` section should become:

```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;700;800;900&display=swap" rel="stylesheet" />
    <title>אָלֶף-בֵּית</title>
  </head>
```

- [ ] **Step 2: Update body font in src/index.css**

Replace the full content of `src/index.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  -webkit-tap-highlight-color: transparent;
  box-sizing: border-box;
}

body {
  font-family: 'Rubik', sans-serif;
  margin: 0;
  padding: 0;
}
```

(Remove `background: #FFF5E6` — each screen sets its own background.)

- [ ] **Step 3: Update tailwind.config.js**

Replace the full content of `tailwind.config.js` with:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Rubik', 'sans-serif'],
        hebrew: ['Rubik', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 4: Run all tests**

```bash
npm test -- --run
```

Expected: 41 tests pass, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add index.html src/index.css tailwind.config.js
git commit -m "style: swap Frank Ruhl Libre for Rubik globally"
```

---

## Task 3: Update LetterCard

**Files:**
- Modify: `src/components/LetterCard.jsx`
- Test: `src/components/LetterCard.test.jsx` (no changes, must still pass)

Key changes:
- Remove `GRADIENT_END` lookup object and `letter.color` usage
- Accept new `index` prop (defaults to `0`)
- Derive card gradient from `CARD_COLORS[index % 5]`
- New shape: `border-radius 20px`, `border-bottom 4px solid rgba(0,0,0,0.14)`, `min-height 84px`
- New typography: 44px/900 letter glyph, 10px/700 word label
- Star repositioned: absolute top-right, `font-size 13px`, drop-shadow filter
- Replace `<button>` with `motion.button` + spring press/hover

- [ ] **Step 1: Verify existing tests pass before touching anything**

```bash
npm test -- --run src/components/LetterCard.test.jsx
```

Expected: 5/5 pass.

- [ ] **Step 2: Rewrite LetterCard.jsx**

Replace the full content of `src/components/LetterCard.jsx` with:

```jsx
import { motion } from 'framer-motion'
import { CARD_COLORS } from '../constants/cardColors'

export function LetterCard({ letter, index = 0, isVisited, onClick }) {
  const { from, to } = CARD_COLORS[index % 5]

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ y: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderBottomWidth: '1px' }}
      whileHover={{ y: -2, boxShadow: '0 8px 20px rgba(0,0,0,0.14)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className="relative flex flex-col items-center justify-center gap-[3px] w-full"
      style={{
        background: `linear-gradient(135deg, ${from}, ${to})`,
        borderRadius: '20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
        borderBottom: '4px solid rgba(0,0,0,0.14)',
        padding: '10px 4px 8px',
        minHeight: '84px',
      }}
    >
      {isVisited && (
        <span
          className="absolute"
          style={{
            top: '5px',
            right: '6px',
            fontSize: '13px',
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))',
          }}
        >
          ⭐
        </span>
      )}
      <span
        className="text-white leading-none"
        style={{ fontSize: '44px', fontWeight: 900, textShadow: '0 2px 6px rgba(0,0,0,0.18)' }}
      >
        {letter.letter}
      </span>
      <span
        style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.88)' }}
      >
        {letter.word}
      </span>
    </motion.button>
  )
}
```

- [ ] **Step 3: Run LetterCard tests**

```bash
npm test -- --run src/components/LetterCard.test.jsx
```

Expected: 5/5 pass. (`motion.button` renders as `role="button"` in jsdom; `index` defaults to 0 when omitted.)

- [ ] **Step 4: Run all tests**

```bash
npm test -- --run
```

Expected: 41/41 pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/LetterCard.jsx
git commit -m "style: restyle LetterCard — 5-color cycle, 3D depth, Framer Motion press/hover"
```

---

## Task 4: Update AlphabetGrid

**Files:**
- Modify: `src/components/AlphabetGrid.jsx`
- Test: `src/components/AlphabetGrid.test.jsx` (no changes, must still pass)

Key changes:
- Replace `background: '#FFF5E6'` with sky/mint/lemon gradient
- Update progress bar: `#e2e8f0` track, `#fb923c → #fbbf24` fill, `height 8px`
- Update title: `font-size 22px`, `font-weight 900`, `color #1e293b`
- Progress text: `font-size 12px`, `font-weight 600`, `color #64748b`
- Pass `index={i}` to each `<LetterCard>`
- Wrap grid with Framer Motion stagger variants

- [ ] **Step 1: Verify existing tests pass before touching anything**

```bash
npm test -- --run src/components/AlphabetGrid.test.jsx
```

Expected: 6/6 pass.

- [ ] **Step 2: Rewrite AlphabetGrid.jsx**

Replace the full content of `src/components/AlphabetGrid.jsx` with:

```jsx
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import letters from '../data/letters.json'
import { useProgress } from '../contexts/ProgressContext'
import { LetterCard } from './LetterCard'

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.6 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 18 } },
}

export function AlphabetGrid() {
  const navigate = useNavigate()
  const { isVisited, visitedCount } = useProgress()

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(160deg, #e0f2fe 0%, #f0fdf4 50%, #fef9c3 100%)' }}
      dir="rtl"
    >
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1
          className="text-center mb-1"
          style={{ fontSize: '22px', fontWeight: 900, color: '#1e293b' }}
        >
          אָלֶף-בֵּית ✨
        </h1>

        <div className="mb-2 mt-3">
          <div
            className="rounded-full overflow-hidden"
            style={{ background: '#e2e8f0', height: '8px' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                background: 'linear-gradient(90deg, #fb923c, #fbbf24)',
                width: `${(visitedCount / 22) * 100}%`,
              }}
            />
          </div>
        </div>

        <p
          className="text-center mb-5"
          style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}
        >
          {visitedCount} מתוך 22 אותיות
        </p>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-4 gap-[9px]"
        >
          {letters.map((letter, i) => (
            <motion.div key={letter.id} variants={cardVariants}>
              <LetterCard
                letter={letter}
                index={i}
                isVisited={isVisited(letter.id)}
                onClick={() => navigate(`/letter/${letter.id}`)}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Run AlphabetGrid tests**

```bash
npm test -- --run src/components/AlphabetGrid.test.jsx
```

Expected: 6/6 pass. (`motion.div` wrappers are transparent in jsdom; `getAllByRole('button')` still finds 22 `motion.button` elements.)

- [ ] **Step 4: Run all tests**

```bash
npm test -- --run
```

Expected: 41/41 pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/AlphabetGrid.jsx
git commit -m "style: restyle AlphabetGrid — gradient bg, index-based card colors, stagger animation"
```

---

## Task 5: Update NavBar

**Files:**
- Modify: `src/components/NavBar.jsx`
- Test: `src/components/NavBar.test.jsx` (no changes, must still pass)

Key changes:
- Background: `transparent` with `backdropFilter: blur(8px)` (no more `#FFE0B2`)
- Home button: white pill shape (`border-radius 50px`, `padding 9px 20px`, `color #475569`, depth shadow)
- Next button: white circle (`52×52px`, `color #f97316`, orange arrow)
- Keep `aria-label="חזור לרשימה"` on home button (required by NavBar test)
- Keep `aria-label="האות הבאה"` on next button
- Keep position text `{currentIndex + 1} מתוך 22`

- [ ] **Step 1: Verify existing tests pass before touching anything**

```bash
npm test -- --run src/components/NavBar.test.jsx
```

Expected: 5/5 pass.

- [ ] **Step 2: Rewrite NavBar.jsx**

Replace the full content of `src/components/NavBar.jsx` with:

```jsx
import { useNavigate } from 'react-router-dom'
import letters from '../data/letters.json'

const pillBase = {
  background: 'white',
  borderRadius: '50px',
  fontWeight: 700,
  color: '#475569',
  boxShadow: '0 2px 8px rgba(0,0,0,0.10), 0 2px 0 rgba(0,0,0,0.07)',
  borderBottom: '3px solid rgba(0,0,0,0.08)',
}

export function NavBar({ currentId }) {
  const navigate = useNavigate()
  const currentIndex = letters.findIndex((l) => l.id === currentId)
  const nextLetter = letters[(currentIndex + 1) % letters.length]

  return (
    <div
      className="flex items-center justify-between px-4 py-3"
      style={{ background: 'transparent', backdropFilter: 'blur(8px)' }}
    >
      <button
        onClick={() => navigate('/play')}
        style={{ ...pillBase, padding: '9px 20px', fontSize: '13px' }}
        aria-label="חזור לרשימה"
      >
        🏠 חזור
      </button>

      <span style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>
        {currentIndex + 1} מתוך 22
      </span>

      <button
        onClick={() => navigate(`/letter/${nextLetter.id}`)}
        style={{
          ...pillBase,
          width: '52px',
          height: '52px',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          fontWeight: 900,
          color: '#f97316',
        }}
        aria-label="האות הבאה"
      >
        ←
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Run NavBar tests**

```bash
npm test -- --run src/components/NavBar.test.jsx
```

Expected: 5/5 pass. (Text content and aria-labels are unchanged; both buttons still render.)

- [ ] **Step 4: Run all tests**

```bash
npm test -- --run
```

Expected: 41/41 pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/NavBar.jsx
git commit -m "style: restyle NavBar — transparent bg, white pill home button, circular next button"
```

---

## Task 6: Update LetterView

**Files:**
- Modify: `src/components/LetterView.jsx`
- Test: `src/components/LetterView.test.jsx` (no changes, must still pass)

Key changes:
- Remove `GRADIENT_END` constant and `letter.color` usage
- Add a back-pill button at the very top of the screen (navigates to `/play`)
- Replace full-width colored banner with a floating **glassmorphism card**
- Glassmorphism card contains: big letter (tappable, colored via `CARD_COLORS`), sound hint `🔊 הקש לשמוע`, word text, image row
- Wrap card content with `AnimatePresence` + `motion.div` keyed to `id`
- Move `<NavBar>` to the bottom of the screen (becomes the nav row)
- Import `useNavigate` (needed for back-pill)

Test compatibility:
- `it('renders the Hebrew letter')` → letter `'א'` is still in the DOM inside the glass card ✓
- `it('renders the Hebrew word')` → word `'אַרְיֵה'` is still in the DOM inside the glass card ✓
- `it('renders the NavBar')` → checks for `'1 מתוך 22'`; NavBar at bottom still renders this text ✓
- `it('marks the letter as visited')` → `useEffect` logic is unchanged ✓
- `it('renders an image')` → `<img>` inside glass card, same `onError` handler ✓
- `it('shows placeholder when all images fail')` → placeholder `🖼️` still rendered when all `imgErrors` set ✓

- [ ] **Step 1: Verify existing tests pass before touching anything**

```bash
npm test -- --run src/components/LetterView.test.jsx
```

Expected: 7/7 pass.

- [ ] **Step 2: Rewrite LetterView.jsx**

Replace the full content of `src/components/LetterView.jsx` with:

```jsx
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import ReactConfetti from 'react-confetti'
import letters from '../data/letters.json'
import { useProgress } from '../contexts/ProgressContext'
import { NavBar } from './NavBar'
import { CARD_COLORS } from '../constants/cardColors'

function playAudio(path) {
  const audio = new Audio(path)
  audio.play().catch(() => {})
}

export function LetterView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const letter = letters.find((l) => l.id === id)
  const letterIndex = letters.findIndex((l) => l.id === id)
  const { isVisited, markVisited } = useProgress()
  const [showConfetti, setShowConfetti] = useState(false)
  const [imgErrors, setImgErrors] = useState(new Set())

  useEffect(() => {
    let timer
    if (!isVisited(id)) {
      setShowConfetti(true)
      timer = setTimeout(() => setShowConfetti(false), 2500)
    }
    markVisited(id)
    setImgErrors(new Set())
    return () => clearTimeout(timer)
  }, [id])

  if (!letter) return null

  const letterColor = CARD_COLORS[letterIndex % 5].from
  const hasVisibleImage = letter.imagePaths.some((_, i) => !imgErrors.has(i))

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #e0f2fe 0%, #f0fdf4 50%, #fef9c3 100%)' }}
    >
      {showConfetti && (
        <ReactConfetti
          recycle={false}
          numberOfPieces={300}
          colors={['#fb923c', '#34d399', '#a78bfa', '#f472b6', '#38bdf8', '#FFD700']}
        />
      )}

      {/* Back pill */}
      <div className="px-4 pt-5">
        <button
          onClick={() => navigate('/play')}
          style={{
            background: 'white',
            borderRadius: '50px',
            padding: '9px 20px',
            fontWeight: 700,
            fontSize: '13px',
            color: '#475569',
            boxShadow: '0 2px 8px rgba(0,0,0,0.10), 0 2px 0 rgba(0,0,0,0.07)',
            borderBottom: '3px solid rgba(0,0,0,0.08)',
          }}
        >
          🏠 חזור
        </button>
      </div>

      {/* Glassmorphism card */}
      <div className="flex-1 px-4 pt-4 pb-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{
              background: 'rgba(255,255,255,0.82)',
              backdropFilter: 'blur(16px)',
              borderRadius: '28px',
              border: '1.5px solid rgba(255,255,255,0.75)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.05)',
              padding: '28px 20px 22px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px',
            }}
            dir="rtl"
          >
            {/* Big letter — tap to hear */}
            <span
              className="cursor-pointer select-none leading-none"
              style={{
                fontSize: '130px',
                fontWeight: 900,
                color: letterColor,
                textShadow: `0 6px 20px ${letterColor}40`,
              }}
              onClick={() => playAudio(letter.audioLetterPath)}
            >
              {letter.letter}
            </span>

            <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8' }}>
              🔊 הקש לשמוע
            </span>

            <p style={{ fontSize: '34px', fontWeight: 900, color: '#1e293b', margin: 0 }}>
              {letter.word}
            </p>

            {/* Image row — tap to hear word */}
            <div
              className="w-full cursor-pointer select-none"
              onClick={() => playAudio(letter.audioWordPath)}
            >
              {hasVisibleImage ? (
                <div style={{ display: 'flex', gap: '10px' }}>
                  {letter.imagePaths.map((src, i) =>
                    imgErrors.has(i) ? null : (
                      <img
                        key={src}
                        src={src}
                        alt={letter.word}
                        style={{
                          flex: 1,
                          height: '160px',
                          objectFit: 'contain',
                          borderRadius: '12px',
                          display: 'block',
                        }}
                        onError={() => setImgErrors((prev) => new Set([...prev, i]))}
                      />
                    )
                  )}
                </div>
              ) : (
                <div
                  className="w-full flex flex-col items-center justify-center gap-2"
                  style={{
                    height: '160px',
                    background: 'linear-gradient(135deg, #FFE0B2, #FFCC80)',
                    border: '2px dashed #FFB347',
                    borderRadius: '12px',
                  }}
                >
                  <span style={{ fontSize: '40px', opacity: 0.5 }}>🖼️</span>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nav row */}
      <NavBar currentId={id} />
    </div>
  )
}
```

- [ ] **Step 3: Run LetterView tests**

```bash
npm test -- --run src/components/LetterView.test.jsx
```

Expected: 7/7 pass.

- [ ] **Step 4: Run all tests**

```bash
npm test -- --run
```

Expected: 41/41 pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/LetterView.jsx
git commit -m "style: restyle LetterView — glassmorphism card, AnimatePresence transitions, back-pill"
```

---

## Task 7: Update MainMenu

**Files:**
- Modify: `src/components/MainMenu.jsx`
- Test: `src/components/MainMenu.test.jsx` (no changes, must still pass)

Key changes:
- Background: sky/mint/lemon gradient (same as other screens)
- Title: `color: #f97316` (orange), `font-size: 28px`, `font-weight: 900`
- Decorative row: `color: #475569`, `letter-spacing: 10px`, `font-size: 20px`
- "התחל" button: `background: linear-gradient(135deg, #fb923c, #f97316)`, `border-radius: 50px`, `border-bottom: 4px solid rgba(0,0,0,0.12)`, depth box-shadow, wrapped with `motion.button`
- Dot visited color: `#fb923c` (was `#FFB347`)
- Dot unvisited color: `#cbd5e1` (was `#E0D8CC`)
- Keep `aria-label="התחל לשחק"` (required by test `getByLabelText('התחל לשחק')`)
- Keep `data-testid="progress-dot"` and `data-visited` attributes

- [ ] **Step 1: Verify existing tests pass before touching anything**

```bash
npm test -- --run src/components/MainMenu.test.jsx
```

Expected: 8/8 pass.

- [ ] **Step 2: Rewrite MainMenu.jsx**

Replace the full content of `src/components/MainMenu.jsx` with:

```jsx
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import letters from '../data/letters.json'
import { useProgress } from '../contexts/ProgressContext'

export function MainMenu() {
  const navigate = useNavigate()
  const { isVisited, visitedCount } = useProgress()

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(160deg, #e0f2fe 0%, #f0fdf4 50%, #fef9c3 100%)' }}
    >
      <div className="text-center px-6" style={{ maxWidth: '420px', width: '100%' }}>
        <h1
          className="font-black mb-3"
          style={{ fontSize: '28px', color: '#f97316', lineHeight: 1.35 }}
        >
          רום לומד את אותיות ה-א, ב
        </h1>

        <p
          className="font-bold mb-8"
          style={{ fontSize: '20px', color: '#475569', letterSpacing: '10px' }}
        >
          א ב ג ד
        </p>

        <motion.button
          onClick={() => navigate('/play')}
          aria-label="התחל לשחק"
          className="font-bold text-white"
          whileTap={{ y: 3, boxShadow: '0 1px 8px rgba(249,115,22,0.2)', borderBottomWidth: '1px' }}
          whileHover={{ y: -2, boxShadow: '0 10px 28px rgba(249,115,22,0.5)' }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          style={{
            background: 'linear-gradient(135deg, #fb923c, #f97316)',
            fontSize: '26px',
            borderRadius: '50px',
            padding: '16px 52px',
            boxShadow: '0 6px 20px rgba(249,115,22,0.4)',
            borderBottom: '4px solid rgba(0,0,0,0.12)',
            minHeight: '64px',
          }}
        >
          התחל
        </motion.button>

        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {letters.map((letter) => (
            <div
              key={letter.id}
              data-testid="progress-dot"
              data-visited={isVisited(letter.id) ? 'true' : 'false'}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: isVisited(letter.id) ? '#fb923c' : '#cbd5e1',
              }}
            />
          ))}
        </div>

        <p className="mt-2 text-sm font-medium" style={{ color: '#64748b' }}>
          {visitedCount} / 22 אותיות
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Run MainMenu tests**

```bash
npm test -- --run src/components/MainMenu.test.jsx
```

Expected: 8/8 pass. (`motion.button` renders as `role="button"` in jsdom; `aria-label="התחל לשחק"` preserved.)

- [ ] **Step 4: Run all tests**

```bash
npm test -- --run
```

Expected: 41/41 pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/MainMenu.jsx
git commit -m "style: restyle MainMenu — gradient bg, orange title, new button/dot colors, motion.button"
```

---

## Final Check

- [ ] **Run the full test suite one last time**

```bash
npm test -- --run
```

Expected: 41/41 pass, 0 skipped.

- [ ] **Start the dev server and visually verify all three screens**

```bash
npm run dev
```

Open `http://localhost:5173` and check:
1. Main Menu: gradient background, orange title, orange gradient button with press animation, dots
2. Alphabet Grid: gradient background, vibrant 5-color cards, 3D depth, stagger animation on load, progress bar
3. Letter View (tap any card): glassmorphism card, big colored letter, sound hint, word, images, back pill at top, nav row at bottom, smooth page transition when tapping next
