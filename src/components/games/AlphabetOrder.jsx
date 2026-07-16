import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ReactConfetti from 'react-confetti'
import { playSuccess } from '../../utils/audio'

const SLOT_SIZE = 56
const SLOT_GAP = 8

export function AlphabetOrder({ letter, allLetters, onComplete }) {
  const letterIndex = allLetters.findIndex((l) => l.id === letter.id)
  const learned = allLetters.slice(0, letterIndex + 1)

  const [placed, setPlaced] = useState(false)
  const [wrongShake, setWrongShake] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const slotRef = useRef(null)
  const pieceRef = useRef(null)
  const lastDragRect = useRef(null)
  const doneRef = useRef(false)
  const timersRef = useRef([])

  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    doneRef.current = false
    setPlaced(false)
    setWrongShake(false)
    setShowConfetti(false)
  }, [letter.id])

  const handleDrag = useCallback(() => {
    const el = pieceRef.current
    if (el) lastDragRect.current = el.getBoundingClientRect()
  }, [])

  const handleDragEnd = useCallback(() => {
    if (doneRef.current) return

    let rect = lastDragRect.current
    if (!rect) {
      const el = pieceRef.current
      if (el) rect = el.getBoundingClientRect()
    }
    lastDragRect.current = null
    if (!rect) return

    const slotEl = slotRef.current
    if (!slotEl) return
    const sr = slotEl.getBoundingClientRect()

    const pieceCx = rect.left + rect.width / 2
    const pieceCy = rect.top + rect.height / 2
    const slotCx = sr.left + sr.width / 2
    const slotCy = sr.top + sr.height / 2

    if (Math.abs(pieceCx - slotCx) > sr.width / 2 || Math.abs(pieceCy - slotCy) > sr.height / 2) {
      setWrongShake(true)
      timersRef.current.push(setTimeout(() => setWrongShake(false), 400))
      return
    }

    doneRef.current = true
    setPlaced(true)
    playSuccess()
    setShowConfetti(true)
    timersRef.current.push(setTimeout(() => setShowConfetti(false), 1500))
    timersRef.current.push(setTimeout(() => onComplete(), 1200))
  }, [onComplete])

  return (
    <div style={{ padding: '12px 0' }}>
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={160} colors={['#fb923c', '#34d399', '#a78bfa', '#f472b6', '#38bdf8']} />}

      <p style={{ textAlign: 'center', fontWeight: 700, fontSize: '16px', color: '#1e293b', marginBottom: '12px', direction: 'rtl' }}>
        גרור את האות למקום הנכון!
      </p>

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
        {learned.map((l, i) => {
          const isCurrent = i === learned.length - 1
          if (isCurrent) {
            return (
              <div
                key={l.id}
                ref={slotRef}
                data-testid="alphabet-slot"
                style={{
                  width: SLOT_SIZE,
                  height: SLOT_SIZE,
                  borderRadius: '12px',
                  border: '2px dashed #cbd5e1',
                  background: placed ? '#ecfdf5' : 'rgba(255,255,255,0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  fontWeight: 900,
                  color: '#059669',
                  transition: 'background 0.2s',
                }}
              >
                {placed ? l.letter : ''}
              </div>
            )
          }
          return (
            <div
              key={l.id}
              style={{
                width: SLOT_SIZE,
                height: SLOT_SIZE,
                borderRadius: '12px',
                background: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                fontWeight: 900,
                color: '#475569',
              }}
            >
              {l.letter}
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', minHeight: SLOT_SIZE + 12 }}>
        <AnimatePresence>
          {!placed && (
            <motion.div
              key="draggable"
              ref={pieceRef}
              data-testid="alphabet-piece"
              drag
              dragMomentum={false}
              dragSnapToOrigin
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              animate={wrongShake ? { x: [-10, 10, -8, 8, 0] } : { x: 0 }}
              transition={wrongShake ? { duration: 0.3 } : { type: 'spring', stiffness: 300, damping: 20 }}
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
              {letter.letter}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {placed && (
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
  )
}
