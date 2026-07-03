import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { NavBar } from './NavBar'

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
})
