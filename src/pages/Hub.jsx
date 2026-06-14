import { Link } from 'react-router-dom'

const GAMES = [
  {
    to: '/tenable',
    emoji: '🔺',
    title: 'Football Tenable',
    tagline: 'Name the top 10, before you run out of lives',
    description: 'A new football trivia question every day. Name as many of the top 10 answers as you can — get 3 wrong and it\'s game over.',
    color: 'hover:border-yellow-500 hover:ring-yellow-500/30',
    accent: 'text-yellow-400',
  },
  {
    to: '/wordle',
    emoji: '🟩',
    title: 'Football Wordle',
    tagline: 'Guess the player\'s surname',
    description: 'A new footballer every day. Guess their surname in 6 tries — green means right spot, yellow means right letter wrong spot.',
    color: 'hover:border-blue-500 hover:ring-blue-500/30',
    accent: 'text-blue-400',
  },
  {
    to: '/tictactoe',
    emoji: '❌⭕',
    title: 'Football TicTacToe',
    tagline: 'Two categories, one player',
    description: 'A daily 3x3 grid where every row and column is a football category. Fill a square by naming a player who fits both — or play a friend 1v1.',
    color: 'hover:border-purple-500 hover:ring-purple-500/30',
    accent: 'text-purple-400',
  },
  {
    to: '/teammates',
    emoji: '🕵️',
    title: 'Guess the Player',
    tagline: 'Name the mystery player',
    description: 'A teammate is revealed one at a time. Work out who the mystery player is in 5 guesses — each wrong answer reveals another teammate.',
    color: 'hover:border-pink-500 hover:ring-pink-500/30',
    accent: 'text-pink-400',
  },
  {
    to: '/501',
    emoji: '🎯',
    title: 'Football 501',
    tagline: 'The football darts trivia game',
    description: 'Count down from 501 by naming footballers. Each player\'s career stat is deducted from your score — land between 0 and −10 to checkout.',
    disabled: true,
  },
]

export default function Hub() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-10 text-center">
        <div className="text-gray-500 text-sm uppercase tracking-widest mb-2 font-medium">Welcome to</div>
        <h1 className="score-number text-6xl md:text-7xl text-white mb-4">FOOTBALL TRIVIA</h1>
        <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">
          A growing collection of football trivia games. Pick a gamemode to get started.
        </p>
      </div>

      <div className="w-full max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {GAMES.map(game => (
            game.disabled ? (
              <div
                key={game.to}
                aria-disabled="true"
                className="relative bg-gray-900/50 border border-gray-800/50 rounded-xl p-6 text-left opacity-60 cursor-not-allowed select-none"
              >
                <div className="text-4xl mb-3 grayscale opacity-60">{game.emoji}</div>
                <div className="text-gray-400 font-bold text-xl leading-tight">{game.title}</div>
                <div className="text-gray-600 text-sm mt-1 font-medium">{game.tagline}</div>
                <div className="mt-3 text-gray-700 text-xs leading-relaxed">{game.description}</div>
                <div className="absolute top-4 right-4">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500 bg-gray-800/80 border border-gray-700 rounded-full px-2.5 py-1">
                    Coming soon
                  </span>
                </div>
              </div>
            ) : (
              <Link
                key={game.to}
                to={game.to}
                className={`group relative bg-gray-900 border border-gray-800 ${game.color} rounded-xl p-6 text-left transition-all duration-200 cursor-pointer ring-1 ring-transparent`}
              >
                <div className="text-4xl mb-3">{game.emoji}</div>
                <div className="text-white font-bold text-xl leading-tight">{game.title}</div>
                <div className={`${game.accent} text-sm mt-1 font-medium`}>{game.tagline}</div>
                <div className="mt-3 text-gray-600 text-xs leading-relaxed">{game.description}</div>
                <div className="absolute top-4 right-4 text-gray-700 group-hover:text-gray-400 transition-colors text-xl">→</div>
              </Link>
            )
          ))}
        </div>
      </div>
    </div>
  )
}
