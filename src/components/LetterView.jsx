import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import ReactConfetti from 'react-confetti'
import letters from '../data/letters.json'
import { useProgress } from '../contexts/ProgressContext'
import { NavBar } from './NavBar'

const GRADIENT_END = {
  '#FFB347': '#FF8C69',
  '#98D8C8': '#7EC8B8',
  '#B5A7D5': '#9E8FC5',
  '#FF8FAB': '#FF6B9D',
  '#95E1D3': '#78CFBE',
}

function playAudio(path) {
  const audio = new Audio(path)
  audio.play().catch(() => {})
}

export function LetterView() {
  const { id } = useParams()
  const letter = letters.find((l) => l.id === id)
  const { isVisited, markVisited } = useProgress()
  const [showConfetti, setShowConfetti] = useState(false)
  const [imgErrors, setImgErrors] = useState(new Set())

  useEffect(() => {
    let timer
    if (!isVisited(id)) {
      setShowConfetti(true)
      timer = setTimeout(() => setShowConfetti(false), 2500)
    }
    markVisited(id)
    setImgErrors(new Set())
    return () => clearTimeout(timer)
  }, [id])

  if (!letter) return null

  const gradient = `linear-gradient(160deg, ${letter.color}, ${GRADIENT_END[letter.color]})`
  const visiblePaths = letter.imagePaths.filter((_, i) => !imgErrors.has(i))

  return (
    <div className="min-h-screen" style={{ background: '#FFF5E6' }}>
      {showConfetti && (
        <ReactConfetti
          recycle={false}
          numberOfPieces={300}
          colors={['#FFB347', '#FF8C69', '#98D8C8', '#B5A7D5', '#FF8FAB', '#FFD700']}
        />
      )}

      <NavBar currentId={id} />

      {/* Letter banner — tap to hear letter name */}
      <div
        className="relative flex items-center justify-center cursor-pointer select-none"
        style={{ background: gradient, paddingTop: '24px', paddingBottom: '24px' }}
        onClick={() => playAudio(letter.audioLetterPath)}
      >
        <span
          className="text-white font-serif leading-none"
          style={{ fontSize: '180px', textShadow: '4px 6px 12px rgba(0,0,0,0.2)' }}
        >
          {letter.letter}
        </span>
        <span
          className="absolute bottom-3 right-4 text-2xl opacity-60"
          aria-hidden="true"
        >
          🔊
        </span>
      </div>

      {/* Word */}
      <div className="text-center mt-5 mb-4 px-4" dir="rtl">
        <p
          className="font-black leading-tight"
          style={{ fontSize: '40px', color: '#3D2B1F' }}
        >
          {letter.word}
        </p>
      </div>

      {/* Image row — tap to hear word */}
      <div
        className="mx-4 mb-6 cursor-pointer select-none"
        onClick={() => playAudio(letter.audioWordPath)}
      >
        {visiblePaths.length > 0 ? (
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
    </div>
  )
}
