import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ProgressProvider } from '../contexts/ProgressContext'
import { AlphabetGrid } from './AlphabetGrid'

beforeEach(() => localStorage.clear())

const renderGrid = () =>
  render(
    <MemoryRouter>
      <ProgressProvider>
        <AlphabetGrid />
      </ProgressProvider>
    </MemoryRouter>
  )

describe('AlphabetGrid', () => {
  it('renders the app title', () => {
    renderGrid()
    expect(screen.getByText(/אָלֶף-בֵּית/)).toBeInTheDocument()
  })

  it('renders all 22 letter cards as buttons', () => {
    renderGrid()
    expect(screen.getAllByRole('button')).toHaveLength(22)
  })

  it('renders the first letter (alef)', () => {
    renderGrid()
    expect(screen.getByText('א')).toBeInTheDocument()
  })

  it('renders the last letter (tav)', () => {
    renderGrid()
    expect(screen.getByText('ת')).toBeInTheDocument()
  })

  it('shows 0 progress initially', () => {
    renderGrid()
    expect(screen.getByText('0 מתוך 22 אותיות')).toBeInTheDocument()
  })

  it('shows updated progress when loaded from localStorage', () => {
    localStorage.setItem('alefbet-progress', JSON.stringify(['alef', 'bet', 'gimel']))
    renderGrid()
    expect(screen.getByText('3 מתוך 22 אותיות')).toBeInTheDocument()
  })
})
