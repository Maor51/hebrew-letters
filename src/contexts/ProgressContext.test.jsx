import { renderHook, act } from '@testing-library/react'
import { ProgressProvider, useProgress } from './ProgressContext'

const wrapper = ({ children }) => <ProgressProvider>{children}</ProgressProvider>

beforeEach(() => {
  localStorage.clear()
})

describe('useProgress', () => {
  it('starts with no visited letters', () => {
    const { result } = renderHook(() => useProgress(), { wrapper })
    expect(result.current.visitedCount).toBe(0)
    expect(result.current.isVisited('alef')).toBe(false)
  })

  it('markVisited adds a letter and updates visitedCount', () => {
    const { result } = renderHook(() => useProgress(), { wrapper })
    act(() => {
      result.current.markVisited('alef')
    })
    expect(result.current.isVisited('alef')).toBe(true)
    expect(result.current.visitedCount).toBe(1)
  })

  it('persists visited ids to localStorage', () => {
    const { result } = renderHook(() => useProgress(), { wrapper })
    act(() => {
      result.current.markVisited('alef')
    })
    const stored = JSON.parse(localStorage.getItem('alefbet-progress'))
    expect(stored).toContain('alef')
  })

  it('loads existing progress from localStorage on mount', () => {
    localStorage.setItem('alefbet-progress', JSON.stringify(['alef', 'bet']))
    const { result } = renderHook(() => useProgress(), { wrapper })
    expect(result.current.isVisited('alef')).toBe(true)
    expect(result.current.isVisited('bet')).toBe(true)
    expect(result.current.visitedCount).toBe(2)
  })

  it('markVisited is idempotent', () => {
    const { result } = renderHook(() => useProgress(), { wrapper })
    act(() => {
      result.current.markVisited('alef')
      result.current.markVisited('alef')
    })
    expect(result.current.visitedCount).toBe(1)
  })
})
