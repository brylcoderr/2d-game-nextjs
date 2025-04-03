export default function GameLegend() {
  return (
    <div className="grid grid-cols-2 gap-4 w-full mt-4 p-4 bg-gray-800 rounded-md border border-gray-700 text-white">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-silver rounded-full"></div>
        <span>Silver Coin: 1 point</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
        <span>Gold Coin: 5 points</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
        <span>Power-up: Temporary invincibility</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
        <span>Multiplier: Double points</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
        <span>Time Bonus: Extra time</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-red-500"></div>
        <span>Obstacles: Game over if hit</span>
      </div>
    </div>
  )
}

