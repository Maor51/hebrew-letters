import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import ReactConfetti from 'react-confetti'
import { playSuccess } from '../../utils/audio'

const GRID_CONFIGS = {
  6:  { cols: 3, rows: 2 },
  8:  { cols: 4, rows: 2 },
  10: { cols: 5, rows: 2 },
  12: { cols: 4, rows: 3 },
}

const DIFFICULTY_OPTIONS = [6, 8, 10, 12]

const MAX_PUZZLES_PER_LETTER = 5

const MAX_PUZZLE_W = 441
const PUZZLE_RATIO = 294 / 441

function pickRandomImages(imagePaths, max) {
  const shuffled = [...imagePaths]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, max)
}

// encodeURI leaves apostrophes unencoded, which breaks unquoted CSS url().
// Encoding each segment separately and quoting the result handles all filenames.
const cssUrl = (path) =>
  `url("${path.split('/').map(encodeURIComponent).join('/')}")`

function buildPieces(cols, rows) {
  const pieces = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      pieces.push({ id: `${col}-${row}`, col, row, solved: false })
    }
  }
  const shuffled = [...pieces]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function LetterPuzzle({ letter, onComplete }) {
  const [difficulty, setDifficulty] = useState(6)
  const [imageIndex, setImageIndex] = useState(0)
  const [sessionImages, setSessionImages] = useState(() => pickRandomImages(letter.imagePaths, MAX_PUZZLES_PER_LETTER))
  const [pieces, setPieces] = useState(() => buildPieces(3, 2))
  const [showConfetti, setShowConfetti] = useState(false)
  const [puzzleW, setPuzzleW] = useState(() => Math.min(MAX_PUZZLE_W, window.innerWidth - 40))
  const slotRefs = useRef({})
  const pieceRefs = useRef({})
  const lastDragRect = useRef({})
  const doneRef = useRef(false)
  const timersRef = useRef([])
  const wrapperRef = useRef(null)
  const { cols, rows } = GRID_CONFIGS[difficulty]
  const imagePath = sessionImages[imageIndex]

  const puzzleH = Math.round(puzzleW * PUZZLE_RATIO)
  const pieceW = Math.floor(puzzleW / cols)
  const pieceH = Math.floor(puzzleH / rows)

  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const obs = new ResizeObserver(([entry]) => {
      setPuzzleW(Math.min(MAX_PUZZLE_W, Math.floor(entry.contentRect.width)))
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    doneRef.current = false
    setImageIndex(0)
    setDifficulty(6)
    setShowConfetti(false)
    setSessionImages(pickRandomImages(letter.imagePaths, MAX_PUZZLES_PER_LETTER))
  }, [letter.id, letter.imagePaths])

  useEffect(() => {
    const { cols, rows } = GRID_CONFIGS[difficulty]
    doneRef.current = false
    setPieces(buildPieces(cols, rows))
  }, [difficulty, imageIndex, letter.id])

  const handleDrag = useCallback((pieceId) => {
    const el = pieceRefs.current[pieceId]
    if (el) lastDragRect.current[pieceId] = el.getBoundingClientRect()
  }, [])

  const handleDragEnd = useCallback((piece) => {
    if (piece.solved) return

    // Prefer rect captured mid-drag; fall back to reading now
    // (rects read synchronously in onDragEnd sometimes miss the drop position
    // because dragSnapToOrigin can start its animation on the same frame).
    let rect = lastDragRect.current[piece.id]
    if (!rect) {
      const el = pieceRefs.current[piece.id]
      if (el) rect = el.getBoundingClientRect()
    }
    delete lastDragRect.current[piece.id]
    if (!rect) return

    const pieceCx = rect.left + rect.width / 2
    const pieceCy = rect.top + rect.height / 2

    const slotEl = slotRefs.current[piece.id]
    if (!slotEl) return
    const sr = slotEl.getBoundingClientRect()
    const slotCx = sr.left + sr.width / 2
    const slotCy = sr.top + sr.height / 2

    // Piece center must land inside the target slot's actual area.
    // Anything more generous overlaps into neighbouring slots and would
    // accept drops in the wrong place.
    if (Math.abs(pieceCx - slotCx) > pieceW / 2) return
    if (Math.abs(pieceCy - slotCy) > pieceH / 2) return

    setPieces((prev) => {
      const next = prev.map((p) => p.id === piece.id ? { ...p, solved: true } : p)
      const allSolved = next.every((p) => p.solved)
      if (allSolved && !doneRef.current) {
        doneRef.current = true
        playSuccess()
        setShowConfetti(true)
        timersRef.current.push(setTimeout(() => setShowConfetti(false), 1500))
        const hasNextImage = imageIndex + 1 < sessionImages.length
        timersRef.current.push(setTimeout(() => {
          if (hasNextImage) {
            setImageIndex((i) => i + 1)
          } else {
            onComplete()
          }
        }, 2000))
      }
      return next
    })
  }, [pieceW, pieceH, imageIndex, sessionImages.length, onComplete])

  const solvedIds = new Set(pieces.filter((p) => p.solved).map((p) => p.id))

  const bgPos = (col, row) =>
    `${cols > 1 ? (col / (cols - 1)) * 100 : 0}% ${rows > 1 ? (row / (rows - 1)) * 100 : 0}%`

  return (
    <LayoutGroup>
      {/* Intentionally NOT dir="rtl": CSS Grid in RTL reverses columns,
          which mirrors the puzzle (col=0 slot shows left-of-image but
          renders on the right). Hebrew text renders correctly via bidi. */}
      <div ref={wrapperRef} style={{ padding: '12px 0' }}>
        {showConfetti && <ReactConfetti recycle={false} numberOfPieces={200} colors={['#fb923c', '#34d399', '#a78bfa', '#f472b6', '#38bdf8']} />}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '12px' }}>
          {imagePath && (
            <img
              src={imagePath}
              alt=""
              style={{ width: '80px', height: '54px', objectFit: 'cover', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: 'white', flexShrink: 0 }}
            />
          )}
          <p style={{ fontWeight: 700, fontSize: '16px', color: '#1e293b', margin: 0 }}>
            השלם את הפאזל!
          </p>
        </div>

        {/* Difficulty toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
          {DIFFICULTY_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              style={{
                padding: '6px 14px',
                borderRadius: '50px',
                fontWeight: 700,
                fontSize: '13px',
                background: d === difficulty ? '#fb923c' : 'white',
                color: d === difficulty ? 'white' : '#64748b',
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
              }}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Target grid */}
        <div style={{ position: 'relative', margin: '0 auto 16px', width: 'fit-content' }}>
          <div
            style={{
              display: 'grid',
              direction: 'ltr',
              gridTemplateColumns: `repeat(${cols}, ${pieceW}px)`,
              gridTemplateRows: `repeat(${rows}, ${pieceH}px)`,
              gap: '2px',
            }}
          >
            {Array.from({ length: cols * rows }).map((_, idx) => {
              const col = idx % cols
              const row = Math.floor(idx / cols)
              const slotId = `${col}-${row}`
              const isFilled = solvedIds.has(slotId)
              return (
                <div
                  key={slotId}
                  data-testid={`slot-${slotId}`}
                  ref={(el) => { slotRefs.current[slotId] = el }}
                  style={{
                    width: pieceW,
                    height: pieceH,
                    border: isFilled ? 'none' : '2px dashed #cbd5e1',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    backgroundColor: 'white',
                  }}
                >
                  {isFilled && imagePath && (
                    <motion.div
                      layoutId={`piece-${slotId}`}
                      style={{
                        width: '100%', height: '100%',
                        backgroundImage: cssUrl(imagePath),
                        backgroundSize: `${cols * 100}% ${rows * 100}%`,
                        backgroundPosition: bgPos(col, row),
                        backgroundRepeat: 'no-repeat',
                        backgroundColor: 'white',
                      }}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* Success overlay */}
          <AnimatePresence>
            {showConfetti && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(52,211,153,0.22)',
                  borderRadius: '8px',
                  pointerEvents: 'none', zIndex: 5,
                }}
              >
                <motion.span
                  animate={{ scale: [0.4, 1.3, 1], rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                  style={{ fontSize: '64px', lineHeight: 1 }}
                >⭐</motion.span>
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 }}
                  style={{ color: '#059669', fontWeight: 900, fontSize: '20px', margin: '8px 0 0' }}
                >כל הכבוד!</motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Piece tray */}
        <div style={{ display: 'flex', direction: 'ltr', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', minHeight: pieceH + 12 }}>
          {pieces.filter((p) => !p.solved).map((piece) => (
            <motion.div
              key={piece.id}
              layoutId={`piece-${piece.id}`}
              data-testid={`piece-${piece.id}`}
              ref={(el) => { pieceRefs.current[piece.id] = el }}
              drag
              dragMomentum={false}
              dragSnapToOrigin
              onDrag={() => handleDrag(piece.id)}
              onDragEnd={() => handleDragEnd(piece)}
              whileDrag={{ scale: 1.1, zIndex: 50, cursor: 'grabbing' }}
              style={{
                width: pieceW,
                height: pieceH,
                borderRadius: '6px',
                overflow: 'hidden',
                cursor: 'grab',
                boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
                flexShrink: 0,
                backgroundImage: imagePath ? cssUrl(imagePath) : 'none',
                backgroundSize: `${cols * 100}% ${rows * 100}%`,
                backgroundPosition: bgPos(piece.col, piece.row),
                backgroundRepeat: 'no-repeat',
                backgroundColor: imagePath ? 'white' : '#e2e8f0',
              }}
            />
          ))}
        </div>
      </div>
    </LayoutGroup>
  )
}
