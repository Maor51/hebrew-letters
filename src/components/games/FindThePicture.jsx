import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ReactConfetti from 'react-confetti'
import { playSuccess } from '../../utils/audio'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildOptions(letter, allLetters, round) {
  const correctPath = letter.imagePaths[round]
  const others = shuffle(allLetters.filter((l) => l.id !== letter.id && l.imagePaths.length > 0))
  const distractors = others.slice(0, 3).map((l) => ({
    id: l.id,
    imagePath: l.imagePaths[0],
    isCorrect: false,
  }))
  return shuffle([{ id: `correct-${round}`, imagePath: correctPath, isCorrect: true }, ...distractors])
}

export function FindThePicture({ letter, allLetters, onComplete }) {
  const totalRounds = Math.min(3, letter.imagePaths.length)
  const [round, setRound] = useState(0)
  const [options, setOptions] = useState(() => buildOptions(letter, allLetters, 0))
  const [pickedId, setPickedId] = useState(null)
  const [wrongId, setWrongId] = useState(null)
  const [completedRounds, setCompletedRounds] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const doneRef = useRef(false)
  const timersRef = useRef([])

  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    setRound(0)
    setOptions(buildOptions(letter, allLetters, 0))
    setPickedId(null)
    setWrongId(null)
    setCompletedRounds(0)
    doneRef.current = false
  }, [letter.id])

  const handlePick = (option) => {
    if (pickedId || doneRef.current) return

    if (option.isCorrect) {
      playSuccess()
      setPickedId(option.id)
      setShowConfetti(true)
      timersRef.current.push(setTimeout(() => setShowConfetti(false), 1500))

      const nextRound = round + 1
      setCompletedRounds(nextRound)

      if (nextRound >= totalRounds) {
        doneRef.current = true
        timersRef.current.push(setTimeout(() => onComplete(), 1200))
      } else {
        timersRef.current.push(setTimeout(() => {
          setRound(nextRound)
          setOptions(buildOptions(letter, allLetters, nextRound))
          setPickedId(null)
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
        {`!בחר את התמונה שמתחילה ב-${letter.letter}`}
      </p>

      <div data-testid="picture-round-dots" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
        {Array.from({ length: totalRounds }).map((_, i) => (
          <span key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: i < completedRounds ? '#fb923c' : '#cbd5e1', display: 'inline-block' }} />
        ))}
      </div>

      <div style={{ display: 'grid', direction: 'ltr', gridTemplateColumns: '1fr 1fr', gap: '10px', maxWidth: '380px', margin: '0 auto', position: 'relative' }}>
        {options.map((option, idx) => {
          const isPicked = pickedId === option.id
          const isWrong = wrongId === option.id
          return (
            <motion.div
              key={`${round}-${idx}`}
              data-testid={`picture-option-${idx}`}
              onClick={() => handlePick(option)}
              animate={
                isPicked
                  ? { scale: 1.04 }
                  : isWrong
                  ? { x: [-10, 10, -8, 8, 0] }
                  : { scale: 1, x: 0 }
              }
              transition={isWrong ? { duration: 0.3 } : { type: 'spring', stiffness: 300, damping: 20 }}
              style={{
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: 'pointer',
                height: '140px',
                backgroundColor: 'white',
                boxShadow: isPicked
                  ? '0 0 0 3px #34d399, 0 4px 12px rgba(0,0,0,0.12)'
                  : isWrong
                  ? '0 0 0 3px #f87171, 0 4px 12px rgba(0,0,0,0.12)'
                  : '0 3px 10px rgba(0,0,0,0.10)',
              }}
            >
              <img
                src={option.imagePath}
                alt=""
                draggable={false}
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
              />
            </motion.div>
          )
        })}

        <AnimatePresence>
          {pickedId && (
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
              >🌟</motion.span>
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
    </div>
  )
}
