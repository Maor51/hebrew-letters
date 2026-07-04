import { render, screen, fireEvent, act } from '@testing-library/react'
import { BalloonPop } from './BalloonPop'

vi.mock('react-confetti', () => ({ default: () => null }))

const alef = {
  id: 'alef', letter: 'א', name: 'אָלֶף', word: 'אַרְיֵה',
  audioLetterPath: '/audio/alef.mp3', audioWordPath: '/audio/word-alef.mp3',
  imagePaths: ['/images/alef.png'], color: '#FFB347',
}

const allLetters = [
  alef,
  { id: 'bet', letter: 'ב', name: 'בֵּית', word: 'בַּיִת', audioLetterPath: '/audio/bet.mp3', audioWordPath: '/audio/word-bet.mp3', imagePaths: [], color: '#FF6B6B' },
  { id: 'gimel', letter: 'ג', name: 'גִּימֶל', word: 'גָּמָל', audioLetterPath: '/audio/gimel.mp3', audioWordPath: '/audio/word-gimel.mp3', imagePaths: [], color: '#4ECDC4' },
  { id: 'dalet', letter: 'ד', name: 'דָּלֶת', word: 'דָּג', audioLetterPath: '/audio/dalet.mp3', audioWordPath: '/audio/word-dalet.mp3', imagePaths: [], color: '#45B7D1' },
]

describe('BalloonPop', () => {
  it('renders 4 balloons', () => {
    render(<BalloonPop letter={alef} allLetters={allLetters} onComplete={() => {}} />)
    expect(screen.getAllByTestId(/^balloon-/).length).toBe(4)
  })

  it('renders a replay button', () => {
    render(<BalloonPop letter={alef} allLetters={allLetters} onComplete={() => {}} />)
    expect(screen.getByText('🔊 שמע שוב')).toBeInTheDocument()
  })

  it('renders round counter', () => {
    render(<BalloonPop letter={alef} allLetters={allLetters} onComplete={() => {}} />)
    expect(screen.getByTestId('round-dots')).toBeInTheDocument()
  })

  it('does not call onComplete on wrong tap', () => {
    const onComplete = vi.fn()
    render(<BalloonPop letter={alef} allLetters={allLetters} onComplete={onComplete} />)
    const wrongBalloon = screen.queryByTestId('balloon-bet')
    if (wrongBalloon) fireEvent.click(wrongBalloon)
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('calls onComplete after 3 correct taps', async () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<BalloonPop letter={alef} allLetters={allLetters} onComplete={onComplete} />)

    for (let round = 0; round < 3; round++) {
      const btn = screen.getByTestId('balloon-alef')
      fireEvent.click(btn)
      await act(async () => { vi.advanceTimersByTime(1200) })
    }

    expect(onComplete).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
})
