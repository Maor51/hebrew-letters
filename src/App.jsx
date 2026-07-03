import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ProgressProvider } from './contexts/ProgressContext'
import { MainMenu } from './components/MainMenu'
import { AlphabetGrid } from './components/AlphabetGrid'
import { LetterView } from './components/LetterView'

export default function App() {
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
