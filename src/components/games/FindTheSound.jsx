import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
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
  const distractors = allLetters
    .filter((l) => l.id !== letter.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
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

  useEffect(() => {
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
      setTimeout(() => setShowConfetti(false), 1500)
      const next = correctRounds + 1
      if (next >= TOTAL_ROUNDS) {
        doneRef.current = true
        setTimeout(() => onComplete(), 1200)
      } else {
        setTimeout(() => {
          setCorrectRounds(next)
          setOptions(buildOptions(letter, allLetters))
          setCorrectId(null)
          setWrongId(null)
        }, 1000)
      }
    } else {
      setWrongId(option.id)
      setTimeout(() => setWrongId(null), 500)
    }
  }

  return (
    <div style={{ padding: '12px 0' }}>
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={80} colors={['#fb923c', '#34d399', '#a78bfa', '#f472b6', '#38bdf8']} />}
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
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
                padding: '14px 8px',
                minHeight: '80px',
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
              <span style={{ fontSize: '44px', fontWeight: 900, color: 'white', textShadow: '0 2px 6px rgba(0,0,0,0.18)', lineHeight: 1 }}>
                {opt.letter}
              </span>
            </motion.button>
          )
        })}
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
