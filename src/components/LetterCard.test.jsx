import { render, screen, fireEvent } from '@testing-library/react'
import { LetterCard } from './LetterCard'

const mockLetter = {
  id: 'alef',
  letter: 'א',
  name: 'אָלֶף',
  word: 'אַרְיֵה',
  color: '#FFB347',
  imagePath: '/images/alef.png',
  audioLetterPath: '/audio/alef.mp3',
  audioWordPath: '/audio/word-alef.mp3',
}

describe('LetterCard', () => {
  it('renders the Hebrew letter', () => {
    render(<LetterCard letter={mockLetter} isVisited={false} onClick={() => {}} />)
    expect(screen.getByText('א')).toBeInTheDocument()
  })

  it('renders the Hebrew word', () => {
    render(<LetterCard letter={mockLetter} isVisited={false} onClick={() => {}} />)
    expect(screen.getByText('אַרְיֵה')).toBeInTheDocument()
  })

  it('shows gold star when visited', () => {
    render(<LetterCard letter={mockLetter} isVisited={true} onClick={() => {}} />)
    expect(screen.getByText('⭐')).toBeInTheDocument()
  })

  it('hides star when not visited', () => {
    render(<LetterCard letter={mockLetter} isVisited={false} onClick={() => {}} />)
    expect(screen.queryByText('⭐')).not.toBeInTheDocument()
  })

  it('calls onClick when tapped', () => {
    const handleClick = vi.fn()
    render(<LetterCard letter={mockLetter} isVisited={false} onClick={handleClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
