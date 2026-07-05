import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import letters from '../data/letters.json'
import { useProgress } from '../contexts/ProgressContext'

export function MainMenu() {
  const navigate = useNavigate()
  const { isVisited, visitedCount } = useProgress()
  const [heroBroken, setHeroBroken] = useState(false)

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(160deg, #e0f2fe 0%, #f0fdf4 50%, #fef9c3 100%)' }}
    >
      <div className="text-center px-6" style={{ maxWidth: '420px', width: '100%' }}>
        {!heroBroken && (
          <img
            src="/images/home.png"
            onError={() => setHeroBroken(true)}
            alt=""
            style={{
              width: '100%',
              maxHeight: '220px',
              objectFit: 'contain',
              borderRadius: '20px',
              marginBottom: '16px',
              backgroundColor: 'white',
              display: 'block',
            }}
          />
        )}

        <h1
          className="font-black mb-3"
          style={{ fontSize: '28px', color: '#f97316', lineHeight: 1.35 }}
        >
          רום לומד את אותיות ה-א, ב
        </h1>

        <p
          className="font-bold mb-8"
          style={{ fontSize: '20px', color: '#475569', letterSpacing: '10px' }}
        >
          א ב ג ד
        </p>

        <motion.button
          onClick={() => navigate('/play')}
          aria-label="התחל לשחק"
          className="font-bold text-white"
          whileTap={{ y: 3, boxShadow: '0 1px 8px rgba(249,115,22,0.2)', borderBottomWidth: '1px' }}
          whileHover={{ y: -2, boxShadow: '0 10px 28px rgba(249,115,22,0.5)' }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          style={{
            background: 'linear-gradient(135deg, #fb923c, #f97316)',
            fontSize: '26px',
            borderRadius: '50px',
            padding: '16px 52px',
            boxShadow: '0 6px 20px rgba(249,115,22,0.4)',
            borderBottomWidth: '4px',
            borderBottomStyle: 'solid',
            borderBottomColor: 'rgba(0,0,0,0.12)',
            minHeight: '64px',
          }}
        >
          התחל
        </motion.button>

        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {letters.map((letter) => (
            <div
              key={letter.id}
              data-testid="progress-dot"
              data-visited={isVisited(letter.id) ? 'true' : 'false'}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: isVisited(letter.id) ? '#fb923c' : '#cbd5e1',
              }}
            />
          ))}
        </div>

        <p className="mt-2 text-sm font-medium" style={{ color: '#64748b' }}>
          {visitedCount} / 22 אותיות
        </p>
      </div>
    </div>
  )
}
