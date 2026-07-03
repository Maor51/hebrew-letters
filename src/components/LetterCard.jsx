const GRADIENT_END = {
  '#FFB347': '#FF8C69',
  '#98D8C8': '#7EC8B8',
  '#B5A7D5': '#9E8FC5',
  '#FF8FAB': '#FF6B9D',
  '#95E1D3': '#78CFBE',
}

export function LetterCard({ letter, isVisited, onClick }) {
  const gradient = `linear-gradient(135deg, ${letter.color}, ${GRADIENT_END[letter.color]})`

  return (
    <button
      onClick={onClick}
      className="relative rounded-[18px] flex flex-col items-center justify-center gap-1"
      style={{
        background: gradient,
        border: isVisited ? '3px solid #FFD700' : '3px solid transparent',
        boxShadow: isVisited
          ? '0 4px 14px rgba(255,215,0,0.3)'
          : '0 2px 8px rgba(0,0,0,0.1)',
        minHeight: '110px',
        padding: '16px 6px 12px',
      }}
    >
      {isVisited && (
        <span className="absolute top-1.5 right-2 text-lg leading-none">⭐</span>
      )}
      <span
        className="text-white font-serif leading-none"
        style={{ fontSize: '72px', textShadow: '2px 3px 6px rgba(0,0,0,0.2)' }}
      >
        {letter.letter}
      </span>
      <span
        className="text-white font-bold"
        style={{ fontSize: '16px', textShadow: '1px 1px 3px rgba(0,0,0,0.15)' }}
      >
        {letter.word}
      </span>
    </button>
  )
}
