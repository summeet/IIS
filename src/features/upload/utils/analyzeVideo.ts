import type { VideoMetrics } from '../types'

export async function analyzeVideo(file: File): Promise<VideoMetrics> {
  const objectUrl = URL.createObjectURL(file)

  try {
    const durationSeconds = await new Promise<number>((resolve, reject) => {
      const videoElement = document.createElement('video')
      videoElement.preload = 'metadata'
      videoElement.src = objectUrl
      videoElement.onloadedmetadata = () => {
        if (Number.isFinite(videoElement.duration)) {
          resolve(videoElement.duration)
        } else {
          resolve(0)
        }
      }
      videoElement.onerror = () => {
        reject(new Error('Unable to read video metadata'))
      }
    })

    const sizeMb = file.size / (1024 * 1024)
    const motionScore = Math.round(
      Math.min(100, sizeMb * 5 + durationSeconds * 0.2),
    )

    return {
      fileName: file.name,
      fileSizeMb: Number(sizeMb.toFixed(2)),
      durationSeconds: Number(durationSeconds.toFixed(1)),
      resolution: 'Auto-detected',
      motionScore,
    }
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

