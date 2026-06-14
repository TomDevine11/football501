import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Hub from './pages/Hub'
import GamePage from './seo/GamePage'

// Lazy-load each game so its (sometimes heavy) data only downloads on its own
// route — the hub and lighter games stay fast, which helps Core Web Vitals.
const Football501 = lazy(() => import('./games/football501/Football501'))
const FootballTenable = lazy(() => import('./games/tenable/FootballTenable'))
const FootballWordle = lazy(() => import('./games/wordle/FootballWordle'))
const TicTacToeMenu = lazy(() => import('./games/tictactoe/TicTacToeMenu'))
const GuessByTeammates = lazy(() => import('./games/teammates/GuessByTeammates'))
const CareerPath = lazy(() => import('./games/careers/CareerPath'))
const WorldCupGuess = lazy(() => import('./games/worldcup/WorldCupGuess'))

const Loading = () => <div className="min-h-screen bg-gray-950" aria-busy="true" />

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Hub />} />
        <Route path="/501" element={<GamePage path="/501"><Football501 /></GamePage>} />
        <Route path="/tenable" element={<GamePage path="/tenable"><FootballTenable /></GamePage>} />
        <Route path="/wordle" element={<GamePage path="/wordle"><FootballWordle /></GamePage>} />
        <Route path="/tictactoe" element={<GamePage path="/tictactoe"><TicTacToeMenu /></GamePage>} />
        <Route path="/teammates" element={<GamePage path="/teammates"><GuessByTeammates /></GamePage>} />
        <Route path="/career-path" element={<GamePage path="/career-path"><CareerPath /></GamePage>} />
        <Route path="/world-cup" element={<GamePage path="/world-cup"><WorldCupGuess /></GamePage>} />
      </Routes>
    </Suspense>
  )
}
