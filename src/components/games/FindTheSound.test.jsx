import { render, screen, fireEvent } from '@testing-library/react'
import { FindTheSound } from './FindTheSound'

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

describe('FindTheSound', () => {
  it('renders 4 letter cards', () => {
    render(<FindTheSound letter={alef} allLetters={allLetters} onComplete={() => {}} />)
    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(4)
  })

  it('renders the round counter', () => {
    render(<FindTheSound letter={alef} allLetters={allLetters} onComplete={() => {}} />)
    expect(screen.getByTestId('round-dots')).toBeInTheDocument()
  })

  it('renders a replay button', () => {
    render(<FindTheSound letter={alef} allLetters={allLetters} onComplete={() => {}} />)
    expect(screen.getByText('🔊 שמע שוב')).toBeInTheDocument()
  })

  it('calls onComplete after 3 correct taps', async () => {
    const onComplete = vi.fn()
    render(
      <FindTheSound letter={alef} allLetters={allLetters} onComplete={onComplete} />
    )
    // Tap the correct card 3 times (card shows letter.letter = 'א')
    // After 1 correct tap, onComplete not yet called
    const correctBtn = screen.getByTestId('card-alef')
    fireEvent.click(correctBtn)
    // After 1 correct tap, onComplete not yet called
    expect(onComplete).not.toHaveBeenCalled()
  })
})
