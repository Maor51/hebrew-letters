import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import ReactConfetti from 'react-confetti'

const GRID_CONFIGS = {
  6:  { cols: 3, rows: 2 },
  8:  { cols: 4, rows: 2 },
  10: { cols: 5, rows: 2 },
  12: { cols: 4, rows: 3 },
}

const DIFFICULTY_OPTIONS = [6, 8, 10, 12]

// Fixed puzzle area — pieces get smaller as difficulty rises; assembled image stays constant.
const PUZZLE_W = 441
const PUZZLE_H = 294

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
  const [pieces, setPieces] = useState(() => buildPieces(3, 2))
  const [showConfetti, setShowConfetti] = useState(false)
  const slotRefs = useRef({})
  const pieceRefs = useRef({})
  const dragStartPos = useRef({})
  const doneRef = useRef(false)
  const timersRef = useRef([])
  const { cols, rows } = GRID_CONFIGS[difficulty]
  const imagePath = letter.imagePaths[imageIndex]

  const pieceW = Math.floor(PUZZLE_W / cols)
  const pieceH = Math.floor(PUZZLE_H / rows)

  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    doneRef.current = false
    setImageIndex(0)
    setDifficulty(6)
    setShowConfetti(false)
  }, [letter.id])

  useEffect(() => {
    const { cols, rows } = GRID_CONFIGS[difficulty]
    doneRef.current = false
    setPieces(buildPieces(cols, rows))
  }, [difficulty, imageIndex, letter.id])

  const handleDragStart = useCallback((piece) => {
    const el = pieceRefs.current[piece.id]
    if (!el) return
    const rect = el.getBoundingClientRect()
    dragStartPos.current[piece.id] = {
      cx: rect.left + rect.width / 2,
      cy: rect.top + rect.height / 2,
    }
  }, [])

  const handleDragEnd = useCallback((piece, _event, info) => {
    if (piece.solved) return

    const startPos = dragStartPos.current[piece.id]
    if (!startPos) return

    // Piece center at release = tray-position center + total drag offset
    const pieceCx = startPos.cx + info.offset.x
    const pieceCy = startPos.cy + info.offset.y

    // Snap if piece center lands anywhere inside the target slot's area
    const snapX = pieceW / 2
    const snapY = pieceH / 2

    let matched = false
    Object.entries(slotRefs.current).forEach(([slotId, el]) => {
      if (!el || slotId !== piece.id) return
      const sr = el.getBoundingClientRect()
      const slotCx = sr.left + sr.width / 2
      const slotCy = sr.top + sr.height / 2
      if (Math.abs(pieceCx - slotCx) <= snapX && Math.abs(pieceCy - slotCy) <= snapY) {
        matched = true
      }
    })

    if (!matched) return

    setPieces((prev) => {
      const next = prev.map((p) => p.id === piece.id ? { ...p, solved: true } : p)
      const allSolved = next.every((p) => p.solved)
      if (allSolved && !doneRef.current) {
        doneRef.current = true
        setShowConfetti(true)
        timersRef.current.push(setTimeout(() => setShowConfetti(false), 1500))
        const hasNextImage = imageIndex + 1 < letter.imagePaths.length
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
  }, [pieceW, pieceH, imageIndex, letter.imagePaths.length, onComplete])

  const solvedIds = new Set(pieces.filter((p) => p.solved).map((p) => p.id))

  const bgPos = (col, row) =>
    `${cols > 1 ? (col / (cols - 1)) * 100 : 0}% ${rows > 1 ? (row / (rows - 1)) * 100 : 0}%`

  return (
    <LayoutGroup>
      <div style={{ padding: '12px 0' }} dir="rtl">
        {showConfetti && <ReactConfetti recycle={false} numberOfPieces={200} colors={['#fb923c', '#34d399', '#a78bfa', '#f472b6', '#38bdf8']} />}

        <p style={{ textAlign: 'center', fontWeight: 700, fontSize: '16px', color: '#1e293b', marginBottom: '12px' }}>
          השלם את הפאזל!
        </p>

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
                        backgroundImage: `url(${imagePath})`,
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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', minHeight: pieceH + 12 }}>
          {pieces.filter((p) => !p.solved).map((piece) => (
            <motion.div
              key={piece.id}
              layoutId={`piece-${piece.id}`}
              data-testid={`piece-${piece.id}`}
              ref={(el) => { pieceRefs.current[piece.id] = el }}
              drag
              dragMomentum={false}
              dragSnapToOrigin
              onDragStart={() => handleDragStart(piece)}
              onDragEnd={(_e, info) => handleDragEnd(piece, _e, info)}
              whileDrag={{ scale: 1.1, zIndex: 50, cursor: 'grabbing' }}
              style={{
                width: pieceW,
                height: pieceH,
                borderRadius: '6px',
                overflow: 'hidden',
                cursor: 'grab',
                boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
                flexShrink: 0,
                backgroundImage: imagePath ? `url(${imagePath})` : 'none',
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
