# AlefBet Mini-Games Design

## Goal

Add three in-letter mini-games to the AlefBet app. Games appear as the user scrolls down within a letter's view. Completing all three games earns the letter's ⭐ visited star (replaces the previous auto-mark-on-navigate behaviour).

## Architecture

Approach A — games as self-contained components in `src/components/games/`. LetterView renders all three below the existing glass card in a single scrollable page. Each game receives `letter`, `allLetters`, and `onComplete`. LetterView tracks which games have fired `onComplete`; when all three have, it calls `markVisited(id)`.

**Hebrew only — no English transliteration anywhere in UI or data.**

## Tech Stack

Vite, React 19, Tailwind CSS v3, Framer Motion, `canvas-confetti` (new dependency).

---

## 1. LetterView Changes

### Scroll Layout

Remove `min-h-screen` fixed layout. Replace with a scrollable `div`. Existing content (back pill + glass card + nav row) remains at the top unchanged. Below it, three game sections appear in order:

1. `<FindTheSound>`
2. `<BalloonPop>`
3. `<LetterPuzzle>`

Each section separated by a thin divider (`border-t border-slate-100`).

### Progress Tracking

```jsx
const [gameDone, setGameDone] = useState({
  findTheSound: false,
  balloonPop: false,
  letterPuzzle: false,
})

const handleGameComplete = (key) =>
  setGameDone((prev) => {
    const next = { ...prev, [key]: true }
    if (next.findTheSound && next.balloonPop && next.letterPuzzle) markVisited(id)
    return next
  })
```

### Remove Auto-markVisited

The existing `useEffect` or inline call to `markVisited(id)` on navigation is removed. The star is earned through game completion only.

---

## 2. FindTheSound (`src/components/games/FindTheSound.jsx`)

**Props:** `letter` (current letter object), `allLetters` (all 22), `onComplete`

### Behaviour

- On mount: pick 3 random distractors from `allLetters` (excluding `letter.id`), shuffle all 4, auto-play `letter.audioLetterPath`
- A "🔊 שמע שוב" replay button re-plays the audio at any time
- Round counter displayed as filled/empty dots (e.g. ●●○ for 2/3 done)
- **3 correct rounds** → `onComplete()`
- New round: re-pick 3 random distractors, re-shuffle, auto-play audio

### Layout

2×2 grid of letter cards. Each card styled identically to `LetterCard` (CARD_COLORS cycle by position, 44px glyph, white text, depth shadow). No word label shown.

### Interactions

| Event | Animation |
|---|---|
| Wrong tap | Framer Motion `x` shake: `[0, -8, 8, -6, 6, 0]` over 400ms |
| Correct tap | `canvas-confetti` burst at tap coords; card scales 1 → 1.2 → 1 over 300ms; after 1s → new round |

---

## 3. BalloonPop (`src/components/games/BalloonPop.jsx`)

**Props:** `letter`, `allLetters`, `onComplete`

### Behaviour

- On mount: spawn 4 balloons (current letter + 3 random distractors from `allLetters`), auto-play `letter.audioLetterPath`
- "🔊 שמע שוב" replay button
- Round counter dots same as FindTheSound
- **3 correct rounds** → `onComplete()`
- New round: re-spawn 4 balloons with new random positions

### Layout

Balloons are colored circles (80px diameter, CARD_COLORS cycle) with letter glyph centered inside. Each balloon floats upward continuously via Framer Motion `animate={{ y: -300 }}` with a staggered delay (`delay: i * 0.3`), `repeat: Infinity`, `repeatType: "loop"`, `duration: 2.5 + Math.random() * 1`.

Balloon string: a thin vertical line (`2px`, `rgba(0,0,0,0.15)`, `20px` long) below each balloon.

### Interactions

| Event | Animation |
|---|---|
| Correct tap | Scale + opacity to 0 (pop, 200ms); `canvas-confetti` at tap coords; after 1s → new round |
| Wrong tap | Short `x` oscillation: `[0, -12, 12, -8, 8, 0]` over 300ms |

---

## 4. LetterPuzzle (`src/components/games/LetterPuzzle.jsx`)

**Props:** `letter`, `onComplete`

### Behaviour

- Default difficulty: 6 pieces
- Difficulty toggle: 4 pill buttons — 6 / 8 / 10 / 12; changing difficulty resets current puzzle
- Grid configs: `6 → 3×2`, `8 → 4×2`, `10 → 5×2`, `12 → 4×3`
- If `letter.imagePaths.length > 1`: after first image puzzle solved, animate success, wait 2s, load second image, reset pieces
- After last image puzzle solved → `onComplete()`
- If `letter.imagePaths.length === 1`: `onComplete()` fires after the single puzzle is solved

### Layout

Two zones stacked vertically:

1. **Target grid** — empty slot outlines (`border-2 border-dashed border-slate-200`, `rounded-lg`). Correctly placed pieces fill their slot.
2. **Piece tray** — shuffled pieces displayed in a wrap row below. Unplaced pieces live here.

### Pieces

Each piece is a `div` showing a slice of the image:
```
backgroundImage: `url(${imagePath})`
backgroundSize: `${cols * 100}% ${rows * 100}%`
backgroundPosition: `${(col / (cols-1)) * 100}% ${(row / (rows-1)) * 100}%`
```

### Drag & Snap

Framer Motion `drag` on each piece. `onDragEnd` checks if piece center is within **40px** of its target slot center:
- **Close enough:** animate to exact slot position, lock (`drag={false}`), brief green glow (`boxShadow: '0 0 0 3px #4ade80'` fading over 400ms)
- **Too far:** animate back to tray position

### Completion

When all pieces are locked → whole puzzle `motion.div` scales 1 → 1.08 → 1 and a short `canvas-confetti` burst fires → wait 2s → proceed to next image or `onComplete()`.

---

## 5. Shared Utilities

`canvas-confetti` calls are wrapped in a tiny helper to keep component code clean:

```js
// src/utils/confetti.js
import confetti from 'canvas-confetti'

export function popConfetti(x, y) {
  confetti({
    particleCount: 60,
    spread: 55,
    origin: { x: x / window.innerWidth, y: y / window.innerHeight },
  })
}
```

Both `FindTheSound` and `BalloonPop` import `popConfetti`.

---

## 6. New Dependency

```
npm install canvas-confetti
```

---

## 7. Testing Strategy

Existing 41 tests remain unchanged. New game components are tested with Vitest + React Testing Library:

- `FindTheSound`: renders 4 cards, tapping correct card fires `onComplete` after 3 correct taps, tapping wrong card does not fire `onComplete`
- `BalloonPop`: renders 4 balloons, same correct/wrong tap assertions
- `LetterPuzzle`: renders difficulty toggle, piece tray, target grid; toggling difficulty resets pieces; `onComplete` fires after all pieces placed
- `LetterView`: `markVisited` is NOT called on mount; IS called after all three `onComplete` callbacks fire

---

## Out of Scope

- Game sound effects beyond existing `audioLetterPath` / `audioWordPath`
- Score tracking or leaderboards
- Accessibility / keyboard navigation for games
- Landscape orientation handling
