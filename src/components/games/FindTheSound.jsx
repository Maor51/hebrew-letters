import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ReactConfetti from 'react-confetti'
import { CARD_COLORS } from '../../constants/cardColors'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function playAudio(path) {
  const audio = new Audio(path)
  audio.play().catch(() => {})
}

function buildOptions(letter, allLetters) {
  const distractors = shuffle(
    allLetters.filter((l) => l.id !== letter.id)
  ).slice(0, 3)
  return shuffle([letter, ...distractors])
}

const TOTAL_ROUNDS = 3

export function FindTheSound({ letter, allLetters, onComplete }) {
  const [options, setOptions] = useState(() => buildOptions(letter, allLetters))
  const [correctRounds, setCorrectRounds] = useState(0)
  const [wrongId, setWrongId] = useState(null)
  const [correctId, setCorrectId] = useState(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const doneRef = useRef(false)
  const timersRef = useRef([])

  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    setOptions(buildOptions(letter, allLetters))
    setCorrectRounds(0)
    setWrongId(null)
    setCorrectId(null)
    doneRef.current = false
  }, [letter.id])

  useEffect(() => {
    playAudio(letter.audioLetterPath)
  }, [letter.id, options])

  const handleTap = (option) => {
    if (correctId || doneRef.current) return
    if (option.id === letter.id) {
      setCorrectId(option.id)
      setShowConfetti(true)
      timersRef.current.push(setTimeout(() => setShowConfetti(false), 1500))
      const next = correctRounds + 1
      if (next >= TOTAL_ROUNDS) {
        doneRef.current = true
        timersRef.current.push(setTimeout(() => onComplete(), 1200))
      } else {
        timersRef.current.push(setTimeout(() => {
          setCorrectRounds(next)
          setOptions(buildOptions(letter, allLetters))
          setCorrectId(null)
          setWrongId(null)
        }, 1000))
      }
    } else {
      setWrongId(option.id)
      timersRef.current.push(setTimeout(() => setWrongId(null), 500))
    }
  }

  return (
    <div style={{ padding: '12px 0' }}>
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={160} colors={['#fb923c', '#34d399', '#a78bfa', '#f472b6', '#38bdf8']} />}
      <p style={{ textAlign: 'center', fontWeight: 700, fontSize: '16px', color: '#1e293b', marginBottom: '12px', direction: 'rtl' }}>
        מצא את האות!
      </p>

      {/* Round dots */}
      <div data-testid="round-dots" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
        {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
          <span key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: i < correctRounds ? '#fb923c' : '#cbd5e1', display: 'inline-block' }} />
        ))}
      </div>

      {/* 2x2 card grid */}
      <div style={{ position: 'relative', marginBottom: '14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {options.map((opt, i) => {
            const { from, to } = CARD_COLORS[i % 5]
            const isWrong = wrongId === opt.id
            const isCorrect = correctId === opt.id
            return (
              <motion.button
                key={opt.id}
                data-testid={`card-${opt.id}`}
                onClick={() => handleTap(opt)}
                animate={
                  isWrong
                    ? { x: [-8, 8, -6, 6, 0] }
                    : isCorrect
                    ? { scale: [1, 1.2, 1] }
                    : {}
                }
                transition={{ duration: 0.35 }}
                style={{
                  background: `linear-gradient(135deg, ${from}, ${to})`,
                  borderRadius: '20px',
                  padding: '22px 8px',
                  minHeight: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
                  borderBottomWidth: '4px',
                  borderBottomStyle: 'solid',
                  borderBottomColor: 'rgba(0,0,0,0.14)',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: '56px', fontWeight: 900, color: 'white', textShadow: '0 2px 6px rgba(0,0,0,0.18)', lineHeight: 1 }}>
                  {opt.letter}
                </span>
              </motion.button>
            )
          })}
        </div>

        {/* Success overlay */}
        <AnimatePresence>
          {correctId && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 18 }}
              style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: 'rgba(52,211,153,0.22)',
                borderRadius: '20px',
                pointerEvents: 'none', zIndex: 5,
              }}
            >
              <motion.span
                animate={{ scale: [0.4, 1.3, 1], rotate: [0, -12, 12, 0] }}
                transition={{ duration: 0.5 }}
                style={{ fontSize: '68px', lineHeight: 1 }}
              >⭐</motion.span>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                style={{ color: '#059669', fontWeight: 900, fontSize: '20px', margin: '8px 0 0', direction: 'rtl' }}
              >כל הכבוד!</motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Replay */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={() => playAudio(letter.audioLetterPath)}
          style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', background: 'white', borderRadius: '50px', padding: '8px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
        >
          🔊 שמע שוב
        </button>
      </div>
    </div>
  )
}
