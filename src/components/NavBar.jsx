import { useNavigate } from 'react-router-dom'
import letters from '../data/letters.json'

export function NavBar({ currentId }) {
  const navigate = useNavigate()
  const currentIndex = letters.findIndex((l) => l.id === currentId)
  const nextLetter = letters[(currentIndex + 1) % letters.length]

  return (
    <div
      className="flex items-center justify-between px-4 py-3"
      style={{ background: '#FFE0B2' }}
    >
      <button
        onClick={() => navigate('/play')}
        className="rounded-xl px-5 py-2.5 text-white font-bold text-xl"
        style={{ background: '#E07B39', minWidth: '52px', minHeight: '52px' }}
        aria-label="חזור לרשימה"
      >
        🏠
      </button>

      <span className="font-bold text-sm" style={{ color: '#A0856C' }}>
        {currentIndex + 1} מתוך 22
      </span>

      <button
        onClick={() => navigate(`/letter/${nextLetter.id}`)}
        className="rounded-xl px-5 py-2.5 text-white font-bold text-xl"
        style={{ background: '#E07B39', minWidth: '52px', minHeight: '52px' }}
        aria-label="האות הבאה"
      >
        ←
      </button>
    </div>
  )
}
