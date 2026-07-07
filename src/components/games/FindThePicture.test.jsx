import { render, screen, act, fireEvent } from '@testing-library/react'
import { FindThePicture } from './FindThePicture'

vi.mock('react-confetti', () => ({ default: () => null }))

const alef = {
  id: 'alef', letter: 'א', word: 'ארנב',
  imagePaths: ['/images/alef1.png', '/images/alef2.png', '/images/alef3.png'],
  audioLetterPath: '/audio/alef.mp3', audioWordPath: '/audio/alef_word.mp3',
}
const bet = {
  id: 'bet', letter: 'ב', word: 'בית',
  imagePaths: ['/images/bet1.png'],
  audioLetterPath: '/audio/bet.mp3', audioWordPath: '/audio/bet_word.mp3',
}
const gimel = {
  id: 'gimel', letter: 'ג', word: 'גמל',
  imagePaths: ['/images/gimel1.png'],
  audioLetterPath: '/audio/gimel.mp3', audioWordPath: '/audio/gimel_word.mp3',
}
const dalet = {
  id: 'dalet', letter: 'ד', word: 'דלת',
  imagePaths: ['/images/dalet1.png'],
  audioLetterPath: '/audio/dalet.mp3', audioWordPath: '/audio/dalet_word.mp3',
}

const allLetters = [alef, bet, gimel, dalet]

describe('FindThePicture', () => {
  it('renders 4 picture options', () => {
    render(<FindThePicture letter={alef} allLetters={allLetters} onComplete={() => {}} />)
    expect(screen.getAllByTestId(/^picture-option-/)).toHaveLength(4)
  })

  it('renders round dots equal to total rounds', () => {
    render(<FindThePicture letter={alef} allLetters={allLetters} onComplete={() => {}} />)
    const dots = screen.getByTestId('picture-round-dots')
    expect(dots.children).toHaveLength(3)
  })

  it('uses 2 rounds when letter has only 2 images', () => {
    const twoImage = { ...alef, imagePaths: ['/images/alef1.png', '/images/alef2.png'] }
    render(<FindThePicture letter={twoImage} allLetters={allLetters} onComplete={() => {}} />)
    const dots = screen.getByTestId('picture-round-dots')
    expect(dots.children).toHaveLength(2)
  })

  it('does not call onComplete before all rounds are done', () => {
    const onComplete = vi.fn()
    render(<FindThePicture letter={alef} allLetters={allLetters} onComplete={onComplete} />)
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('calls onComplete after all rounds are answered correctly', async () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<FindThePicture letter={alef} allLetters={allLetters} onComplete={onComplete} />)

    for (let r = 0; r < 3; r++) {
      const options = screen.getAllByTestId(/^picture-option-/)
      const correctOption = options.find((el) =>
        el.querySelector('img')?.getAttribute('src')?.includes('alef')
      )
      await act(async () => { fireEvent.click(correctOption) })
      await act(async () => { vi.advanceTimersByTime(1500) })
    }

    await act(async () => { vi.advanceTimersByTime(1500) })
    expect(onComplete).toHaveBeenCalled()
    vi.useRealTimers()
  })
})
