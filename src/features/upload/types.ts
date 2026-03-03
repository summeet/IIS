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

/* Upload video API response – API may return null for any field */
export type FighterCorner = {
  corner_name?: string | null
  trunk_color_detected?: string | null
  confidence_score?: number | null
}

/** Fighter/participant data – keys are dynamic from API (e.g. total_punches, custom metrics) */
export type FighterData = {
  corner?: FighterCorner | null
  [key: string]: unknown
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


