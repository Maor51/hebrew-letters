import { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ProgressProvider } from './contexts/ProgressContext'
import { MainMenu } from './components/MainMenu'
import { AlphabetGrid } from './components/AlphabetGrid'
import { LetterView } from './components/LetterView'

function useBackgroundMusic() {
  useEffect(() => {
    const audio = new Audio('/audio/background.mp3')
    audio.loop = true
    audio.volume = 0.25

    const start = () => audio.play().catch(() => {})
    document.addEventListener('click', start, { once: true })
    document.addEventListener('touchstart', start, { once: true })

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [])
}

export default function App() {
  useBackgroundMusic()

  return (
    <BrowserRouter>
      <ProgressProvider>
        <Routes>
          <Route path="/" element={<MainMenu />} />
          <Route path="/play" element={<AlphabetGrid />} />
          <Route path="/letter/:id" element={<LetterView />} />
        </Routes>
      </ProgressProvider>
    </BrowserRouter>
  )
}
