import { useEffect, useRef } from 'react'

export default function Noise({
  patternSize = 250,
  patternScaleX = 1,
  patternScaleY = 1,
  patternRefreshInterval = 2,
  patternAlpha = 15
}) {
  const canvasRef = useRef(null)
  const frameRef = useRef(0)
  const patternCanvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const patternCanvas = document.createElement('canvas')
    patternCanvas.width = patternSize
    patternCanvas.height = patternSize
    const patternCtx = patternCanvas.getContext('2d')
    patternCanvasRef.current = patternCanvas

    function resize() {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    function generateNoise() {
      const imageData = patternCtx.createImageData(patternSize, patternSize)
      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 255
        data[i] = value
        data[i + 1] = value
        data[i + 2] = value
        data[i + 3] = patternAlpha
      }
      patternCtx.putImageData(imageData, 0, 0)
    }

    function draw(frame) {
      if (frame % patternRefreshInterval === 0) {
        generateNoise()
        const pattern = ctx.createPattern(patternCanvas, 'repeat')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.save()
        ctx.scale(patternScaleX, patternScaleY)
        ctx.fillStyle = pattern
        ctx.fillRect(0, 0, canvas.width / patternScaleX, canvas.height / patternScaleY)
        ctx.restore()
      }
    }

    let animFrame
    function loop(frame = 0) {
      draw(frame)
      frameRef.current = frame
      animFrame = requestAnimationFrame(() => loop(frame + 1))
    }

    resize()
    generateNoise()
    loop()

    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(animFrame)
      window.removeEventListener('resize', resize)
    }
  }, [patternSize, patternScaleX, patternScaleY, patternRefreshInterval, patternAlpha])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  )
}