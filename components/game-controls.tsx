"use client"

import { Button } from "@/components/ui/button"
import { Pause, Play, RotateCcw } from "lucide-react"

interface GameControlsProps {
  isPaused: boolean
  isGameOver: boolean
  onPause: () => void
  onRestart: () => void
}

export default function GameControls({ isPaused, isGameOver, onPause, onRestart }: GameControlsProps) {
  return (
    <div className="flex gap-4 mt-4">
      {!isGameOver && (
        <Button
          onClick={onPause}
          variant="outline"
          className="border-gray-600 text-black hover:bg-gray-700 flex items-center gap-2"
          size="lg"
        >
          {isPaused ? (
            <>
              <Play className="w-5 h-5" /> Resume
            </>
          ) : (
            <>
              <Pause className="w-5 h-5" /> Pause
            </>
          )}
        </Button>
      )}
      {isGameOver && (
        <Button onClick={onRestart} className="bg-green-600 hover:bg-green-700 flex items-center gap-2" size="lg">
          <RotateCcw className="w-5 h-5" /> Play Again
        </Button>
      )}
    </div>
  )
}

