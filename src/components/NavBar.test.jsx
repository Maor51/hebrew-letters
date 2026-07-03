import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { NavBar } from './NavBar'

function LocationDisplay() {
  const { pathname } = useLocation()
  return <div data-testid="location">{pathname}</div>
}

const renderNavBar = (currentId) =>
  render(
    <MemoryRouter initialEntries={[`/letter/${currentId}`]}>
      <Routes>
        <Route path="/letter/:id" element={<NavBar currentId={currentId} />} />
      </Routes>
    </MemoryRouter>
  )

describe('NavBar', () => {
  it('shows position 1 מתוך 22 for alef', () => {
    renderNavBar('alef')
    expect(screen.getByText('1 מתוך 22')).toBeInTheDocument()
  })

  it('shows position 22 מתוך 22 for tav', () => {
    renderNavBar('tav')
    expect(screen.getByText('22 מתוך 22')).toBeInTheDocument()
  })

  it('shows position 12 מתוך 22 for lamed (index 11)', () => {
    renderNavBar('lamed')
    expect(screen.getByText('12 מתוך 22')).toBeInTheDocument()
  })

  it('renders back-to-grid and next-letter buttons', () => {
    renderNavBar('alef')
    expect(screen.getAllByRole('button')).toHaveLength(2)
  })

  it('home button navigates to /play', () => {
    render(
      <MemoryRouter initialEntries={['/letter/alef']}>
        <Routes>
          <Route path="/letter/:id" element={<NavBar currentId="alef" />} />
          <Route path="/play" element={<LocationDisplay />} />
        </Routes>
      </MemoryRouter>
    )
    fireEvent.click(screen.getByLabelText('חזור לרשימה'))
    expect(screen.getByTestId('location')).toHaveTextContent('/play')
  })
})
