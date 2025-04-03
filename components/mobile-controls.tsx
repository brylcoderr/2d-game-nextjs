"use client"
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react"

interface MobileControlsProps {
  onControlPress: (key: string, pressed: boolean) => void
  isVisible: boolean
}

export default function MobileControls({ onControlPress, isVisible }: MobileControlsProps) {
  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 left-0 right-0 flex justify-between px-4 z-10 max-w-md mx-auto">
      <div className="flex flex-col items-center">
        <button
          className="w-16 h-16 bg-gray-800/80 rounded-full flex items-center justify-center mb-2 active:bg-gray-700 border-2 border-gray-600"
          onTouchStart={() => onControlPress("ArrowUp", true)}
          onTouchEnd={() => onControlPress("ArrowUp", false)}
          onMouseDown={() => onControlPress("ArrowUp", true)}
          onMouseUp={() => onControlPress("ArrowUp", false)}
          onMouseLeave={() => onControlPress("ArrowUp", false)}
        >
          <ArrowUp className="w-8 h-8 text-white" />
        </button>
        <div className="flex gap-2">
          <button
            className="w-16 h-16 bg-gray-800/80 rounded-full flex items-center justify-center active:bg-gray-700 border-2 border-gray-600"
            onTouchStart={() => onControlPress("ArrowLeft", true)}
            onTouchEnd={() => onControlPress("ArrowLeft", false)}
            onMouseDown={() => onControlPress("ArrowLeft", true)}
            onMouseUp={() => onControlPress("ArrowLeft", false)}
            onMouseLeave={() => onControlPress("ArrowLeft", false)}
          >
            <ArrowLeft className="w-8 h-8 text-white" />
          </button>
          <button
            className="w-16 h-16 bg-gray-800/80 rounded-full flex items-center justify-center active:bg-gray-700 border-2 border-gray-600"
            onTouchStart={() => onControlPress("ArrowDown", true)}
            onTouchEnd={() => onControlPress("ArrowDown", false)}
            onMouseDown={() => onControlPress("ArrowDown", true)}
            onMouseUp={() => onControlPress("ArrowDown", false)}
            onMouseLeave={() => onControlPress("ArrowDown", false)}
          >
            <ArrowDown className="w-8 h-8 text-white" />
          </button>
        </div>
      </div>
      <div>
        <button
          className="w-16 h-16 bg-gray-800/80 rounded-full flex items-center justify-center active:bg-gray-700 border-2 border-gray-600"
          onTouchStart={() => onControlPress("ArrowRight", true)}
          onTouchEnd={() => onControlPress("ArrowRight", false)}
          onMouseDown={() => onControlPress("ArrowRight", true)}
          onMouseUp={() => onControlPress("ArrowRight", false)}
          onMouseLeave={() => onControlPress("ArrowRight", false)}
        >
          <ArrowRight className="w-8 h-8 text-white" />
        </button>
      </div>
    </div>
  )
}

