import { useNavigate } from 'react-router-dom'
import letters from '../data/letters.json'
import { useProgress } from '../contexts/ProgressContext'

export function MainMenu() {
  const navigate = useNavigate()
  const { isVisited, visitedCount } = useProgress()

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: '#FFF5E6' }}
    >
      <div className="text-center px-6" style={{ maxWidth: '420px', width: '100%' }}>
        <h1
          className="font-black mb-3"
          style={{ fontSize: '32px', color: '#FF8C69', lineHeight: 1.35 }}
        >
          רום לומד את אותיות ה-א, ב
        </h1>

        <p
          className="font-bold mb-8"
          style={{ fontSize: '24px', color: '#8B7355', letterSpacing: '8px' }}
        >
          א ב ג ד
        </p>

        <button
          onClick={() => navigate('/play')}
          className="font-bold text-white"
          style={{
            background: 'linear-gradient(135deg, #FFB347, #FF8C69)',
            fontSize: '28px',
            borderRadius: '40px',
            padding: '18px 56px',
            boxShadow: '0 4px 16px rgba(255,140,105,0.45)',
            minHeight: '64px',
          }}
        >
          התחל
        </button>

        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {letters.map((letter) => (
            <div
              key={letter.id}
              data-testid="progress-dot"
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: isVisited(letter.id) ? '#FFB347' : '#E0D8CC',
              }}
            />
          ))}
        </div>

        <p className="mt-2 text-sm font-medium" style={{ color: '#8B7355' }}>
          {visitedCount} / 22 אותיות
        </p>
      </div>
    </div>
  )
}
