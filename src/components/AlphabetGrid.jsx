import { useNavigate } from 'react-router-dom'
import letters from '../data/letters.json'
import { useProgress } from '../contexts/ProgressContext'
import { LetterCard } from './LetterCard'

export function AlphabetGrid() {
  const navigate = useNavigate()
  const { isVisited, visitedCount } = useProgress()

  return (
    <div className="min-h-screen" style={{ background: '#FFF5E6' }} dir="rtl">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1
          className="text-center font-black mb-1"
          style={{ fontSize: '28px', color: '#E07B39' }}
        >
          אָלֶף-בֵּית ✨
        </h1>

        <div className="mb-2 mt-3">
          <div
            className="rounded-full overflow-hidden"
            style={{ background: '#FFE0B2', height: '12px' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                background: 'linear-gradient(90deg, #E07B39, #FFB347)',
                width: `${(visitedCount / 22) * 100}%`,
              }}
            />
          </div>
        </div>

        <p className="text-center text-sm mb-5" style={{ color: '#A0856C' }}>
          {visitedCount} מתוך 22 אותיות
        </p>

        <div className="grid grid-cols-4 gap-3">
          {letters.map((letter) => (
            <LetterCard
              key={letter.id}
              letter={letter}
              isVisited={isVisited(letter.id)}
              onClick={() => navigate(`/letter/${letter.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
