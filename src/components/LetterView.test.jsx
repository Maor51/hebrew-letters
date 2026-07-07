import { render, screen, act, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ProgressProvider } from '../contexts/ProgressContext'
import { LetterView } from './LetterView'
import letters from '../data/letters.json'

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
vi.mock('./games/FindThePicture', () => ({
  FindThePicture: ({ onComplete }) => (
    <button onClick={onComplete} data-testid="picture-complete">FindThePicture</button>
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

  it('renders the NavBar', () => {
    renderLetterView('alef')
    expect(screen.getByText('1 מתוך 22')).toBeInTheDocument()
  })

  it('does NOT mark letter as visited on mount', () => {
    renderLetterView('alef')
    const stored = JSON.parse(localStorage.getItem('alefbet-progress') || '[]')
    expect(stored).not.toContain('alef')
  })

  it('marks letter as visited only after all four games complete', async () => {
    renderLetterView('alef')
    expect(JSON.parse(localStorage.getItem('alefbet-progress') || '[]')).not.toContain('alef')

    await act(async () => { fireEvent.click(screen.getByTestId('find-complete')) })
    expect(JSON.parse(localStorage.getItem('alefbet-progress') || '[]')).not.toContain('alef')

    await act(async () => { fireEvent.click(screen.getByTestId('balloon-complete')) })
    expect(JSON.parse(localStorage.getItem('alefbet-progress') || '[]')).not.toContain('alef')

    await act(async () => { fireEvent.click(screen.getByTestId('picture-complete')) })
    expect(JSON.parse(localStorage.getItem('alefbet-progress') || '[]')).not.toContain('alef')

    await act(async () => { fireEvent.click(screen.getByTestId('puzzle-complete')) })
    expect(JSON.parse(localStorage.getItem('alefbet-progress') || '[]')).toContain('alef')
  })

  it('renders the first image in the carousel', () => {
    const alef = letters.find((l) => l.id === 'alef')
    if (!alef?.imagePaths.length) return  // skip if no images configured
    renderLetterView('alef')
    const img = screen.getAllByRole('img')[0]
    expect(img).toHaveAttribute('src', alef.imagePaths[0])
  })

  it('shows placeholder when all images fail to load', async () => {
    const alef = letters.find((l) => l.id === 'alef')
    if (!alef?.imagePaths.length) return  // skip if no images configured
    renderLetterView('alef')
    // Fire error for every image path by repeatedly triggering the error handler
    for (let n = 0; n < alef.imagePaths.length; n++) {
      const img = screen.queryByRole('img')
      if (!img) break
      await act(async () => { img.dispatchEvent(new Event('error')) })
    }
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('🖼️')).toBeInTheDocument()
  })
})
