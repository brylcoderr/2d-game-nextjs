interface GameStatsProps {
  score: number
  isPaused: boolean
  highScore?: number
  level?: number
  invincible?: boolean
  multiplier?: number
}

export default function GameStats({
  score,
  isPaused,
  highScore = 0,
  level = 1,
  invincible = false,
  multiplier = 1,
}: GameStatsProps) {
  return (
    <div className="flex justify-between w-full mb-2 p-2 bg-gray-800 rounded-md border border-gray-700">
      <div className="flex gap-4">
        <div className="text-white text-xl font-bold">Score: {score}</div>
        <div className="text-yellow-400 text-xl font-bold">High: {highScore}</div>
        <div className="text-blue-400 text-xl font-bold">Level: {level}</div>
      </div>
      <div className="flex items-center gap-2">
        {multiplier > 1 && <div className="text-green-400 text-xl font-bold animate-pulse">{multiplier}x</div>}
        {invincible && <div className="text-purple-400 text-xl font-bold animate-pulse">INVINCIBLE!</div>}
        {isPaused && <div className="text-yellow-400 text-xl font-bold">PAUSED</div>}
      </div>
    </div>
  )
}

