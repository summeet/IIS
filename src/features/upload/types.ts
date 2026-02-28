export type VideoMetrics = {
  fileName: string
  fileSizeMb: number
  durationSeconds: number
  resolution?: string
  motionScore: number
}

export type VideoReport = VideoMetrics & {
  id: string
  createdAt: string
}

/* Upload video API response (boxing analysis) – API may return null for any field */
export type FighterCorner = {
  corner_name: string | null
  trunk_color_detected: string | null
  confidence_score: number | null
}

export type FighterData = {
  corner: FighterCorner
  total_punches: number | null
  landed: number | null
  accuracy: number | null
  jabs: number | null
  hooks: number | null
  ring_control: number | null
  distance_covered: number | null
  blocks: number | null
}

export type UploadVideoResponse = {
  message: string
  user_id: string
  response: {
    fighter_A: FighterData
    fighter_B: FighterData
  }
  report: {
    _id: string
    user_id: string
    sport: string
    performance: Record<string, FighterData>
    created_at: string
    updated_at: string
  }
}

/** Result shown after upload: API response + file name for display */
export type UploadResult = UploadVideoResponse & {
  fileName: string
}


