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

function buildBalloons(letter, allLetters) {
  const distractors = shuffle(
    allLetters.filter((l) => l.id !== letter.id)
  ).slice(0, 3)
  const xPositions = shuffle([8, 26, 54, 72])
  return shuffle([letter, ...distractors]).map((l, i) => ({
    ...l,
    xPercent: xPositions[i],
    duration: 2.5 + Math.random() * 1.5,
    delay: Math.random() * 0.6,
    colorIndex: i,
  }))
}

const TOTAL_ROUNDS = 3

export function BalloonPop({ letter, allLetters, onComplete }) {
  const [balloons, setBalloons] = useState(() => buildBalloons(letter, allLetters))
  const [poppedId, setPoppedId] = useState(null)
  const [wrongId, setWrongId] = useState(null)
  const [correctRounds, setCorrectRounds] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const doneRef = useRef(false)
  const timersRef = useRef([])

  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    setBalloons(buildBalloons(letter, allLetters))
    setCorrectRounds(0)
    setPoppedId(null)
    setWrongId(null)
    doneRef.current = false
  }, [letter.id])

  useEffect(() => {
    playAudio(letter.audioLetterPath)
  }, [letter.id, balloons])

  const handleTap = (balloon) => {
    if (poppedId || doneRef.current) return
    if (balloon.id === letter.id) {
      setPoppedId(balloon.id)
      setShowConfetti(true)
      timersRef.current.push(setTimeout(() => setShowConfetti(false), 1500))
      setCorrectRounds((prev) => {
        const next = prev + 1
        if (next >= TOTAL_ROUNDS) {
          doneRef.current = true
          timersRef.current.push(setTimeout(() => onComplete(), 1200))
        } else {
          timersRef.current.push(setTimeout(() => {
            setBalloons(buildBalloons(letter, allLetters))
            setPoppedId(null)
            setWrongId(null)
          }, 1000))
        }
        return next
      })
    } else {
      setWrongId(balloon.id)
      timersRef.current.push(setTimeout(() => setWrongId(null), 400))
    }
  }

  return (
    <div style={{ padding: '12px 0' }}>
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={160} colors={['#fb923c', '#34d399', '#a78bfa', '#f472b6', '#38bdf8']} />}

      <p style={{ textAlign: 'center', fontWeight: 700, fontSize: '16px', color: '#1e293b', marginBottom: '12px', direction: 'rtl' }}>
        פוצץ את הבלון הנכון!
      </p>

      <div data-testid="round-dots" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
        {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
          <span key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: i < correctRounds ? '#fb923c' : '#cbd5e1', display: 'inline-block' }} />
        ))}
      </div>

      {/* Balloon field */}
      <div style={{ position: 'relative', height: '320px', overflow: 'hidden', marginBottom: '14px' }}>
        {balloons.map((balloon) => {
          const { from } = CARD_COLORS[balloon.colorIndex % 5]
          const isPopped = poppedId === balloon.id
          const isWrong = wrongId === balloon.id
          return (
            <motion.div
              key={balloon.id}
              data-testid={`balloon-${balloon.id}`}
              onClick={() => handleTap(balloon)}
              style={{
                position: 'absolute',
                left: `${balloon.xPercent}%`,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              animate={
                isPopped
                  ? { scale: 0, opacity: 0 }
                  : isWrong
                  ? { x: [-12, 12, -8, 8, 0] }
                  : { y: [0, -300] }
              }
              transition={
                isPopped
                  ? { duration: 0.2 }
                  : isWrong
                  ? { duration: 0.3 }
                  : { duration: balloon.duration, delay: balloon.delay, repeat: Infinity, repeatType: 'loop', ease: 'linear' }
              }
            >
              <div style={{
                width: '96px', height: '96px', borderRadius: '50%',
                background: `radial-gradient(circle at 35% 35%, ${from}cc, ${from})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}>
                <span style={{ fontSize: '48px', fontWeight: 900, color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.2)', lineHeight: 1 }}>
                  {balloon.letter}
                </span>
              </div>
              {/* String */}
              <div style={{ width: '2px', height: '20px', background: 'rgba(0,0,0,0.15)' }} />
            </motion.div>
          )
        })}

        {/* Success overlay */}
        <AnimatePresence>
          {poppedId && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 18 }}
              style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                pointerEvents: 'none', zIndex: 5,
              }}
            >
              <motion.span
                animate={{ scale: [0.3, 1.4, 1.1, 1], rotate: [0, -15, 15, 0] }}
                transition={{ duration: 0.6 }}
                style={{ fontSize: '80px', lineHeight: 1 }}
              >🎉</motion.span>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{ color: '#059669', fontWeight: 900, fontSize: '22px', margin: '10px 0 0', direction: 'rtl', textShadow: '0 1px 4px rgba(255,255,255,0.9)' }}
              >כל הכבוד!</motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
