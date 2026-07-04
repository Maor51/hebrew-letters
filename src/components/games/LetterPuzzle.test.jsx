import { render, screen, fireEvent } from '@testing-library/react'
import { LetterPuzzle } from './LetterPuzzle'

vi.mock('react-confetti', () => ({ default: () => null }))

const alef = {
  id: 'alef', letter: 'א', name: 'אָלֶף', word: 'אַרְיֵה',
  audioLetterPath: '/audio/alef.mp3', audioWordPath: '/audio/word-alef.mp3',
  imagePaths: ['/images/alef.png'], color: '#FFB347',
}

const alefTwoImages = {
  ...alef,
  imagePaths: ['/images/alef.png', '/images/alef2.png'],
}

describe('LetterPuzzle', () => {
  it('renders difficulty toggle with 4 options', () => {
    render(<LetterPuzzle letter={alef} onComplete={() => {}} />)
    expect(screen.getByText('6')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('renders 6 target slots by default', () => {
    render(<LetterPuzzle letter={alef} onComplete={() => {}} />)
    expect(screen.getAllByTestId(/^slot-/).length).toBe(6)
  })

  it('renders 6 pieces in tray by default', () => {
    render(<LetterPuzzle letter={alef} onComplete={() => {}} />)
    expect(screen.getAllByTestId(/^piece-/).length).toBe(6)
  })

  it('changes piece count when difficulty toggled to 12', () => {
    render(<LetterPuzzle letter={alef} onComplete={() => {}} />)
    fireEvent.click(screen.getByText('12'))
    expect(screen.getAllByTestId(/^slot-/).length).toBe(12)
    expect(screen.getAllByTestId(/^piece-/).length).toBe(12)
  })
})
