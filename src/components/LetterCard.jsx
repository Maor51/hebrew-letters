import { motion } from 'framer-motion'
import { CARD_COLORS } from '../constants/cardColors'

export function LetterCard({ letter, index = 0, isVisited, onClick }) {
  const { from, to } = CARD_COLORS[index % 5]

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ y: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderBottomWidth: '1px' }}
      whileHover={{ y: -2, boxShadow: '0 8px 20px rgba(0,0,0,0.14)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className="relative flex flex-col items-center justify-center gap-[3px] w-full"
      style={{
        background: `linear-gradient(135deg, ${from}, ${to})`,
        borderRadius: '20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
        borderBottom: '4px solid rgba(0,0,0,0.14)',
        padding: '10px 4px 8px',
        minHeight: '84px',
      }}
    >
      {isVisited && (
        <span
          className="absolute"
          style={{
            top: '5px',
            right: '6px',
            fontSize: '13px',
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))',
          }}
        >
          ⭐
        </span>
      )}
      <span
        className="text-white leading-none"
        style={{ fontSize: '44px', fontWeight: 900, textShadow: '0 2px 6px rgba(0,0,0,0.18)' }}
      >
        {letter.letter}
      </span>
      <span
        style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.88)' }}
      >
        {letter.word}
      </span>
    </motion.button>
  )
}
