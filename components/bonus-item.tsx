interface BonusItemProps {
  x: number
  y: number
  width: number
  height: number
  type: string
  value: number
  rotation: number
  onDraw: (ctx: CanvasRenderingContext2D) => void
}

export default function BonusItem({ x, y, width, height, type, value, rotation, onDraw }: BonusItemProps) {
  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.save()
    ctx.translate(x + width / 2, y + height / 2)
    ctx.rotate(rotation)

    if (type === "multiplier") {
      // Draw multiplier bonus
      ctx.fillStyle = "#10b981" // emerald-500
      ctx.beginPath()
      ctx.arc(0, 0, width / 2, 0, Math.PI * 2)
      ctx.fill()

      // Draw "x2" text
      ctx.fillStyle = "white"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.font = "bold 12px Arial"
      ctx.fillText(`x${value}`, 0, 0)
    } else if (type === "timeBonus") {
      // Draw time bonus
      ctx.fillStyle = "#3b82f6" // blue-500
      ctx.beginPath()
      ctx.arc(0, 0, width / 2, 0, Math.PI * 2)
      ctx.fill()

      // Draw clock icon
      ctx.strokeStyle = "white"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(0, 0, width / 3, 0, Math.PI * 2)
      ctx.stroke()

      // Draw clock hands
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(0, -width / 6)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(width / 8, 0)
      ctx.stroke()
    }

    ctx.restore()

    // Call the onDraw callback if provided
    if (onDraw) {
      onDraw(ctx)
    }
  }

  return null // This is a helper component for drawing, doesn't render anything
}

