import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ProgressProvider } from '../contexts/ProgressContext'
import { MainMenu } from './MainMenu'

beforeEach(() => localStorage.clear())

const renderMainMenu = () =>
  render(
    <MemoryRouter>
      <ProgressProvider>
        <MainMenu />
      </ProgressProvider>
    </MemoryRouter>
  )

describe('MainMenu', () => {
  it('renders the personalised title', () => {
    renderMainMenu()
    expect(screen.getByText('רום לומד את אותיות ה-א, ב')).toBeInTheDocument()
  })

  it('renders the decorative Hebrew letters', () => {
    renderMainMenu()
    expect(screen.getByText('א ב ג ד')).toBeInTheDocument()
  })

  it('renders the play button', () => {
    renderMainMenu()
    expect(screen.getByRole('button', { name: 'התחל' })).toBeInTheDocument()
  })

  it('renders 22 progress dots', () => {
    renderMainMenu()
    expect(screen.getAllByTestId('progress-dot')).toHaveLength(22)
  })

  it('shows 0 / 22 אותיות initially', () => {
    renderMainMenu()
    expect(screen.getByText('0 / 22 אותיות')).toBeInTheDocument()
  })

  it('shows updated count when letters have been visited', () => {
    localStorage.setItem('alefbet-progress', JSON.stringify(['alef', 'bet', 'gimel']))
    renderMainMenu()
    expect(screen.getByText('3 / 22 אותיות')).toBeInTheDocument()
  })
})
