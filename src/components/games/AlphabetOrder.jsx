import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import ReactConfetti from 'react-confetti'
import { playSuccess } from '../../utils/audio'

const SLOT_SIZE = 56
const SLOT_GAP = 8

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function AlphabetOrder({ letter, allLetters, onComplete }) {
  const letterIndex = allLetters.findIndex((l) => l.id === letter.id)
  const learned = useMemo(() => allLetters.slice(0, letterIndex + 1), [allLetters, letterIndex])

  const [placedIds, setPlacedIds] = useState(() => new Set())
  const [pool, setPool] = useState(() => shuffle(learned))
  const [wrongShakeId, setWrongShakeId] = useState(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const slotRefs = useRef({})
  const pieceRefs = useRef({})
  const lastDragRect = useRef({})
  const doneRef = useRef(false)
  const timersRef = useRef([])

  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    doneRef.current = false
    setPlacedIds(new Set())
    setPool(shuffle(learned))
    setWrongShakeId(null)
    setShowConfetti(false)
  }, [letter.id, learned])

  const handleDrag = useCallback((pieceId) => {
    const el = pieceRefs.current[pieceId]
    if (el) lastDragRect.current[pieceId] = el.getBoundingClientRect()
  }, [])

  const handleDragEnd = useCallback((piece) => {
    if (doneRef.current) return

    let rect = lastDragRect.current[piece.id]
    if (!rect) {
      const el = pieceRefs.current[piece.id]
      if (el) rect = el.getBoundingClientRect()
    }
    delete lastDragRect.current[piece.id]
    if (!rect) return

    const slotEl = slotRefs.current[piece.id]
    if (!slotEl) return
    const sr = slotEl.getBoundingClientRect()

    const pieceCx = rect.left + rect.width / 2
    const pieceCy = rect.top + rect.height / 2
    const slotCx = sr.left + sr.width / 2
    const slotCy = sr.top + sr.height / 2

    if (Math.abs(pieceCx - slotCx) > sr.width / 2 || Math.abs(pieceCy - slotCy) > sr.height / 2) {
      setWrongShakeId(piece.id)
      timersRef.current.push(setTimeout(() => setWrongShakeId((cur) => (cur === piece.id ? null : cur)), 400))
      return
    }

    setPlacedIds((prev) => {
      if (prev.has(piece.id)) return prev
      const next = new Set(prev)
      next.add(piece.id)
      if (next.size === learned.length && !doneRef.current) {
        doneRef.current = true
        playSuccess()
        setShowConfetti(true)
        timersRef.current.push(setTimeout(() => setShowConfetti(false), 1500))
        timersRef.current.push(setTimeout(() => onComplete(), 1400))
      }
      return next
    })
    setPool((prev) => prev.filter((l) => l.id !== piece.id))
  }, [learned.length, onComplete])

  const allPlaced = placedIds.size === learned.length

  return (
    <LayoutGroup>
      <div style={{ padding: '12px 0' }}>
        {showConfetti && <ReactConfetti recycle={false} numberOfPieces={160} colors={['#fb923c', '#34d399', '#a78bfa', '#f472b6', '#38bdf8']} />}

        <p style={{ textAlign: 'center', fontWeight: 700, fontSize: '16px', color: '#1e293b', marginBottom: '12px', direction: 'rtl' }}>
          גרור כל אות למקום הנכון!
        </p>

        {/* Slots row (alphabet order) */}
        <div
          dir="rtl"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: `${SLOT_GAP}px`,
            marginBottom: '20px',
          }}
        >
          {learned.map((l) => {
            const isFilled = placedIds.has(l.id)
            return (
              <div
                key={l.id}
                ref={(el) => { slotRefs.current[l.id] = el }}
                data-testid={`alphabet-slot-${l.id}`}
                style={{
                  width: SLOT_SIZE,
                  height: SLOT_SIZE,
                  borderRadius: '12px',
                  border: isFilled ? 'none' : '2px dashed #cbd5e1',
                  background: isFilled ? '#ecfdf5' : 'rgba(255,255,255,0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  fontWeight: 900,
                  color: '#059669',
                  transition: 'background 0.2s',
                }}
              >
                {isFilled && (
                  <motion.span layoutId={`alphabet-piece-${l.id}`} style={{ display: 'inline-block' }}>
                    {l.letter}
                  </motion.span>
                )}
              </div>
            )
          })}
        </div>

        {/* Draggable pool */}
        <div
          dir="rtl"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: `${SLOT_GAP}px`,
            minHeight: SLOT_SIZE + 12,
          }}
        >
          <AnimatePresence>
            {pool.map((l) => {
              const shaking = wrongShakeId === l.id
              return (
                <motion.div
                  key={l.id}
                  layoutId={`alphabet-piece-${l.id}`}
                  ref={(el) => { pieceRefs.current[l.id] = el }}
                  data-testid={`alphabet-piece-${l.id}`}
                  drag
                  dragMomentum={false}
                  dragSnapToOrigin
                  onDrag={() => handleDrag(l.id)}
                  onDragEnd={() => handleDragEnd(l)}
                  animate={shaking ? { x: [-10, 10, -8, 8, 0] } : { x: 0 }}
                  transition={shaking ? { duration: 0.3 } : { type: 'spring', stiffness: 300, damping: 20 }}
                  whileDrag={{ scale: 1.15, zIndex: 50, cursor: 'grabbing' }}
                  style={{
                    width: SLOT_SIZE,
                    height: SLOT_SIZE,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #fb923c, #f97316)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                    fontWeight: 900,
                    cursor: 'grab',
                    boxShadow: '0 4px 14px rgba(251,146,60,0.45)',
                    userSelect: 'none',
                    touchAction: 'none',
                  }}
                >
                  {l.letter}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {allPlaced && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: 'center', color: '#059669', fontWeight: 900, fontSize: '20px', margin: '12px 0 0', direction: 'rtl' }}
            >
              כל הכבוד!
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  )
}
