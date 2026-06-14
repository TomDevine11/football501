import { Routes, Route } from 'react-router-dom'
import Hub from './pages/Hub'
import Football501 from './games/football501/Football501'
import FootballTenable from './games/tenable/FootballTenable'
import FootballWordle from './games/wordle/FootballWordle'
import TicTacToeMenu from './games/tictactoe/TicTacToeMenu'
import GuessByTeammates from './games/teammates/GuessByTeammates'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Hub />} />
      <Route path="/501" element={<Football501 />} />
      <Route path="/tenable" element={<FootballTenable />} />
      <Route path="/wordle" element={<FootballWordle />} />
      <Route path="/tictactoe" element={<TicTacToeMenu />} />
      <Route path="/teammates" element={<GuessByTeammates />} />
    </Routes>
  )
}
