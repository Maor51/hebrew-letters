function playSound(path) {
  const audio = new Audio(path)
  audio.play().catch(() => {})
}

export const playSuccess = () => playSound('/audio/success.mp3')
export const playBubblePop = () => playSound('/audio/bubble-pop.mp3')
