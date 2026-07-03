import { createContext, useCallback, useContext, useState } from 'react'

const STORAGE_KEY = 'alefbet-progress'

function loadVisited() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

const ProgressContext = createContext(null)

export function ProgressProvider({ children }) {
  const [visitedIds, setVisitedIds] = useState(() => loadVisited())

  const markVisited = useCallback((id) => {
    setVisitedIds((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]))
      return next
    })
  }, [])

  const isVisited = useCallback((id) => visitedIds.has(id), [visitedIds])

  return (
    <ProgressContext.Provider
      value={{ isVisited, markVisited, visitedCount: visitedIds.size, visitedIds }}
    >
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  return useContext(ProgressContext)
}
