import { useNavigate } from 'react-router-dom'
import letters from '../data/letters.json'

const pillBase = {
  background: 'white',
  borderRadius: '50px',
  fontWeight: 700,
  color: '#475569',
  boxShadow: '0 2px 8px rgba(0,0,0,0.10), 0 2px 0 rgba(0,0,0,0.07)',
  borderBottom: '3px solid rgba(0,0,0,0.08)',
}

export function NavBar({ currentId }) {
  const navigate = useNavigate()
  const currentIndex = letters.findIndex((l) => l.id === currentId)
  const nextLetter = letters[(currentIndex + 1) % letters.length]

  return (
    <div
      className="flex items-center justify-between px-4 py-3"
      style={{ background: 'transparent', backdropFilter: 'blur(8px)' }}
    >
      <button
        onClick={() => navigate('/play')}
        style={{ ...pillBase, padding: '9px 20px', fontSize: '13px' }}
        aria-label="חזור לרשימה"
      >
        🏠 חזור
      </button>

      <span style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>
        {currentIndex + 1} מתוך 22
      </span>

      <button
        onClick={() => navigate(`/letter/${nextLetter.id}`)}
        style={{
          ...pillBase,
          width: '52px',
          height: '52px',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          fontWeight: 900,
          color: '#f97316',
        }}
        aria-label="האות הבאה"
      >
        ←
      </button>
    </div>
  )
}
