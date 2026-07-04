import { render, screen, act, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ProgressProvider } from '../contexts/ProgressContext'
import { LetterView } from './LetterView'

vi.mock('react-confetti', () => ({ default: () => null }))
vi.mock('./games/FindTheSound', () => ({
  FindTheSound: ({ onComplete }) => (
    <button onClick={onComplete} data-testid="find-complete">FindTheSound</button>
  ),
}))
vi.mock('./games/BalloonPop', () => ({
  BalloonPop: ({ onComplete }) => (
    <button onClick={onComplete} data-testid="balloon-complete">BalloonPop</button>
  ),
}))
vi.mock('./games/LetterPuzzle', () => ({
  LetterPuzzle: ({ onComplete }) => (
    <button onClick={onComplete} data-testid="puzzle-complete">LetterPuzzle</button>
  ),
}))

beforeEach(() => localStorage.clear())

const renderLetterView = (id) =>
  render(
    <MemoryRouter initialEntries={[`/letter/${id}`]}>
      <ProgressProvider>
        <Routes>
          <Route path="/letter/:id" element={<LetterView />} />
        </Routes>
      </ProgressProvider>
    </MemoryRouter>
  )

describe('LetterView', () => {
  it('renders the Hebrew letter', () => {
    renderLetterView('alef')
    expect(screen.getByText('א')).toBeInTheDocument()
  })

  it('renders the Hebrew word', () => {
    renderLetterView('alef')
    expect(screen.getByText('אַרְיֵה')).toBeInTheDocument()
  })

  it('renders the NavBar', () => {
    renderLetterView('alef')
    expect(screen.getByText('1 מתוך 22')).toBeInTheDocument()
  })

  it('does NOT mark letter as visited on mount', () => {
    renderLetterView('alef')
    const stored = JSON.parse(localStorage.getItem('alefbet-progress') || '[]')
    expect(stored).not.toContain('alef')
  })

  it('marks letter as visited only after all three games complete', async () => {
    renderLetterView('alef')
    expect(JSON.parse(localStorage.getItem('alefbet-progress') || '[]')).not.toContain('alef')

    await act(async () => { fireEvent.click(screen.getByTestId('find-complete')) })
    expect(JSON.parse(localStorage.getItem('alefbet-progress') || '[]')).not.toContain('alef')

    await act(async () => { fireEvent.click(screen.getByTestId('balloon-complete')) })
    expect(JSON.parse(localStorage.getItem('alefbet-progress') || '[]')).not.toContain('alef')

    await act(async () => { fireEvent.click(screen.getByTestId('puzzle-complete')) })
    expect(JSON.parse(localStorage.getItem('alefbet-progress') || '[]')).toContain('alef')
  })

  it('renders an image for each path in imagePaths', () => {
    renderLetterView('alef')
    const imgs = screen.getAllByRole('img')
    expect(imgs).toHaveLength(2)
    expect(imgs[0]).toHaveAttribute('src', '/images/alef1.png')
    expect(imgs[1]).toHaveAttribute('src', '/images/alef2.png')
  })

  it('shows placeholder when all images fail to load', async () => {
    renderLetterView('alef')
    const imgs = screen.getAllByRole('img')
    await act(async () => {
      imgs.forEach((img) => img.dispatchEvent(new Event('error')))
    })
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('🖼️')).toBeInTheDocument()
  })
})
