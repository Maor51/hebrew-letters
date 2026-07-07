import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import letters from '../data/letters.json'
import { useProgress } from '../contexts/ProgressContext'
import { NavBar } from './NavBar'
import { CARD_COLORS } from '../constants/cardColors'
import { FindTheSound } from './games/FindTheSound'
import { BalloonPop } from './games/BalloonPop'
import { FindThePicture } from './games/FindThePicture'
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
  const videoTimerRef = useRef(null)
  const [showVideo, setShowVideo] = useState(false)
  const [imgErrors, setImgErrors] = useState(new Set())
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [gameDone, setGameDone] = useState({
    findTheSound: false,
    balloonPop: false,
    findThePicture: false,
    letterPuzzle: false,
  })

  // Reset when letter changes
  useEffect(() => {
    if (videoTimerRef.current) clearTimeout(videoTimerRef.current)
    setGameDone({ findTheSound: false, balloonPop: false, findThePicture: false, letterPuzzle: false })
    setImgErrors(new Set())
    setCarouselIndex(0)
    setShowVideo(false)
  }, [id])

  const handleGameComplete = (key) => {
    setGameDone((prev) => {
      if (prev[key]) return prev
      return { ...prev, [key]: true }
    })
  }

  useEffect(() => {
    if (gameDone.findTheSound && gameDone.balloonPop && gameDone.findThePicture && gameDone.letterPuzzle) {
      markVisited(id)
      videoTimerRef.current = setTimeout(() => setShowVideo(true), 400)
    }
    // `id` intentionally omitted: on letter change, the [id] effect resets
    // gameDone but its state update hasn't applied yet — including id here
    // would re-fire with stale (all-true) gameDone and schedule the video
    // for the next letter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameDone, markVisited])

  if (!letter) return null

  const nextIndex = (letterIndex + 1) % letters.length
  const handleVideoEnd = () => {
    setShowVideo(false)
    navigate(`/letter/${letters[nextIndex].id}`)
  }
  const letterColor = CARD_COLORS[letterIndex % 5].from
  const visibleImages = letter.imagePaths
    .map((src, i) => ({ src, i }))
    .filter(({ i }) => !imgErrors.has(i))
  const clampedCarousel = Math.min(carouselIndex, Math.max(0, visibleImages.length - 1))
  const currentImage = visibleImages[clampedCarousel] ?? null

  return (
    <div
      style={{ background: 'linear-gradient(160deg, #e0f2fe 0%, #f0fdf4 50%, #fef9c3 100%)', minHeight: '100vh' }}
    >
      {/* Celebration video overlay */}
      {showVideo && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'black',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <video
            src="/videos/julie.mp4"
            autoPlay
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onEnded={handleVideoEnd}
          />
          <button
            onClick={handleVideoEnd}
            style={{
              position: 'absolute', top: '20px', right: '20px',
              background: 'rgba(255,255,255,0.25)',
              color: 'white',
              borderRadius: '50px',
              padding: '10px 22px',
              fontWeight: 700, fontSize: '15px',
              backdropFilter: 'blur(4px)',
              border: '1.5px solid rgba(255,255,255,0.35)',
            }}
          >
            דלג ←
          </button>
        </div>
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
        <div
          key={id}
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

            <div className="w-full select-none">
              {currentImage ? (
                <div>
                  <div style={{ position: 'relative' }}>
                    <div
                      style={{ height: '160px', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'white', cursor: 'pointer' }}
                      onClick={() => playAudio(letter.audioWordPath)}
                    >
                      <img
                        src={currentImage.src}
                        alt={letter.word}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                        onError={() => setImgErrors((prev) => new Set([...prev, currentImage.i]))}
                      />
                    </div>
                    {visibleImages.length > 1 && (
                      <>
                        <button
                          onClick={() => setCarouselIndex((idx) => (idx - 1 + visibleImages.length) % visibleImages.length)}
                          style={{
                            position: 'absolute', left: '6px', top: '50%', transform: 'translateY(-50%)',
                            background: 'rgba(255,255,255,0.88)', borderRadius: '50%',
                            width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.18)', fontSize: '16px', fontWeight: 700,
                          }}
                        >‹</button>
                        <button
                          onClick={() => setCarouselIndex((idx) => (idx + 1) % visibleImages.length)}
                          style={{
                            position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)',
                            background: 'rgba(255,255,255,0.88)', borderRadius: '50%',
                            width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.18)', fontSize: '16px', fontWeight: 700,
                          }}
                        >›</button>
                      </>
                    )}
                  </div>
                  {visibleImages.length > 1 && (
                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginTop: '8px' }}>
                      {visibleImages.map((_, i) => (
                        <div
                          key={i}
                          onClick={() => setCarouselIndex(i)}
                          style={{
                            width: '7px', height: '7px', borderRadius: '50%', cursor: 'pointer',
                            background: i === clampedCarousel ? letterColor : '#cbd5e1',
                            transition: 'background 0.2s',
                          }}
                        />
                      ))}
                    </div>
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
        </div>
      </div>

      {/* Nav row */}
      <NavBar currentId={id} />

      {/* Games */}
      <div className="px-4 pb-10" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <AnimatePresence>
          {!gameDone.findTheSound && (
            <motion.div
              key="findTheSound"
              exit={{ opacity: 0, scale: 0.75, y: -12 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 1, 1] }}
              style={{ transformOrigin: 'top center' }}
            >
              <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />
              <FindTheSound
                letter={letter}
                allLetters={letters}
                onComplete={() => handleGameComplete('findTheSound')}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!gameDone.balloonPop && (
            <motion.div
              key="balloonPop"
              exit={{ opacity: 0, scale: 0.75, y: -12 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 1, 1] }}
              style={{ transformOrigin: 'top center' }}
            >
              <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />
              <BalloonPop
                letter={letter}
                allLetters={letters}
                onComplete={() => handleGameComplete('balloonPop')}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!gameDone.findThePicture && (
            <motion.div
              key="findThePicture"
              exit={{ opacity: 0, scale: 0.75, y: -12 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 1, 1] }}
              style={{ transformOrigin: 'top center' }}
            >
              <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />
              <FindThePicture
                letter={letter}
                allLetters={letters}
                onComplete={() => handleGameComplete('findThePicture')}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!gameDone.letterPuzzle && (
            <motion.div
              key="letterPuzzle"
              exit={{ opacity: 0, scale: 0.75, y: -12 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 1, 1] }}
              style={{ transformOrigin: 'top center' }}
            >
              <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />
              <LetterPuzzle
                letter={letter}
                onComplete={() => handleGameComplete('letterPuzzle')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
