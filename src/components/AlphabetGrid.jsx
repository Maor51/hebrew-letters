import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import letters from '../data/letters.json'
import { useProgress } from '../contexts/ProgressContext'
import { LetterCard } from './LetterCard'

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.6 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 18 } },
}

export function AlphabetGrid() {
  const navigate = useNavigate()
  const { isVisited, visitedCount } = useProgress()

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(160deg, #e0f2fe 0%, #f0fdf4 50%, #fef9c3 100%)' }}
      dir="rtl"
    >
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1
          className="text-center mb-1"
          style={{ fontSize: '22px', fontWeight: 900, color: '#1e293b' }}
        >
          אָלֶף-בֵּית ✨
        </h1>

        <div className="mb-2 mt-3">
          <div
            className="rounded-full overflow-hidden"
            style={{ background: '#e2e8f0', height: '8px' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                background: 'linear-gradient(90deg, #fb923c, #fbbf24)',
                width: `${(visitedCount / 22) * 100}%`,
              }}
            />
          </div>
        </div>

        <p
          className="text-center mb-5"
          style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}
        >
          {visitedCount} מתוך 22 אותיות
        </p>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-4 gap-[9px]"
        >
          {letters.map((letter, i) => (
            <motion.div key={letter.id} variants={cardVariants}>
              <LetterCard
                letter={letter}
                index={i}
                isVisited={isVisited(letter.id)}
                onClick={() => navigate(`/letter/${letter.id}`)}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
