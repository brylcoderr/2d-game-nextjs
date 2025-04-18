"use client"

import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Volume2, VolumeX, Home } from "lucide-react"

interface PauseMenuProps {
  onResume: () => void
  onRestart: () => void
  onHome: () => void
  onToggleSound: () => void
  soundEnabled: boolean
}

export default function PauseMenu({ onResume, onRestart, onHome, onToggleSound, soundEnabled }: PauseMenuProps) {
  return (
    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 rounded-md">
      <div className="text-3xl font-bold text-white mb-8">Game Paused</div>
      <div className="flex flex-col gap-4 w-64">
        <Button
          onClick={onResume}
          className="bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2 py-6"
          size="lg"
        >
          <Play className="w-5 h-5" /> Resume Game
        </Button>
        <Button
          onClick={onRestart}
          className="bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
          variant="outline"
        >
          <RotateCcw className="w-5 h-5" /> Restart Game
        </Button>
        <Button
          onClick={onToggleSound}
          className="bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2"
          variant="outline"
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-5 h-5" /> Sound: On
            </>
          ) : (
            <>
              <VolumeX className="w-5 h-5" /> Sound: Off
            </>
          )}
        </Button>
        <Button
          onClick={onHome}
          className="bg-white hover:bg-gray-700 flex items-center justify-center gap-2"
          variant="outline"
        >
          <Home className="w-5 h-5" /> Main Menu
        </Button>
      </div>
    </div>
  )
}

