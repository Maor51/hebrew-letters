import { render, screen, act } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ProgressProvider } from '../contexts/ProgressContext'
import { LetterView } from './LetterView'

vi.mock('react-confetti', () => ({ default: () => null }))

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

  it('marks the letter as visited on mount', () => {
    renderLetterView('alef')
    const stored = JSON.parse(localStorage.getItem('alefbet-progress') || '[]')
    expect(stored).toContain('alef')
  })

  it('renders an image for each path in imagePaths', () => {
    renderLetterView('alef')
    const imgs = screen.getAllByRole('img')
    expect(imgs).toHaveLength(1)
    expect(imgs[0]).toHaveAttribute('src', '/images/alef.png')
  })

  it('shows placeholder when all images fail to load', async () => {
    renderLetterView('alef')
    const img = screen.getByRole('img')
    await act(async () => {
      img.dispatchEvent(new Event('error'))
    })
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('🖼️')).toBeInTheDocument()
  })
})
