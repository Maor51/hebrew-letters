import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import ReactConfetti from 'react-confetti'
import letters from '../data/letters.json'
import { useProgress } from '../contexts/ProgressContext'
import { NavBar } from './NavBar'
import { CARD_COLORS } from '../constants/cardColors'
import { FindTheSound } from './games/FindTheSound'
import { BalloonPop } from './games/BalloonPop'
import { LetterPuzzle } from './games/LetterPuzzle'

function playAudio(path) {
  const audio = new Audio(path)
  audio.play().catch(() => {})
}

export function LetterView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const letterIndex = letters.findIndex((l) => l.id === id)
  const letter = letters[letterIndex]
  const { isVisited, markVisited } = useProgress()
  const [showConfetti, setShowConfetti] = useState(false)
  const [imgErrors, setImgErrors] = useState(new Set())
  const [gameDone, setGameDone] = useState({
    findTheSound: false,
    balloonPop: false,
    letterPuzzle: false,
  })

  // Reset game completion when letter changes
  useEffect(() => {
    setGameDone({ findTheSound: false, balloonPop: false, letterPuzzle: false })
    setImgErrors(new Set())
  }, [id])

  const handleGameComplete = (key) => {
    setGameDone((prev) => {
      if (prev[key]) return prev
      return { ...prev, [key]: true }
    })
  }

  useEffect(() => {
    if (gameDone.findTheSound && gameDone.balloonPop && gameDone.letterPuzzle) {
      if (!isVisited(id)) {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 2500)
      }
      markVisited(id)
    }
  }, [gameDone, id, isVisited, markVisited])

  if (!letter) return null

  const letterColor = CARD_COLORS[letterIndex % 5].from
  const hasVisibleImage = letter.imagePaths.some((_, i) => !imgErrors.has(i))

  return (
    <div
      style={{ background: 'linear-gradient(160deg, #e0f2fe 0%, #f0fdf4 50%, #fef9c3 100%)', minHeight: '100vh' }}
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
          aria-label="חזור לרשימה"
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
      <div className="px-4 pt-4 pb-2">
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

      {/* Games */}
      <div className="px-4 pb-10" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />
        <FindTheSound
          letter={letter}
          allLetters={letters}
          onComplete={() => handleGameComplete('findTheSound')}
        />
        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />
        <BalloonPop
          letter={letter}
          allLetters={letters}
          onComplete={() => handleGameComplete('balloonPop')}
        />
        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />
        <LetterPuzzle
          letter={letter}
          onComplete={() => handleGameComplete('letterPuzzle')}
        />
      </div>
    </div>
  )
}
