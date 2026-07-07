function playSound(path) {
  const audio = new Audio(path)
  audio.play().catch(() => {})
}

export const playSuccess = () => {
  const audio = new Audio('/audio/success.mp3')
  audio.volume = 0.5
  audio.play().catch(() => {})
}
export const playBubblePop = () => playSound('/audio/bubble-pop.mp3')
