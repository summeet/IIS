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

/** Fighter/participant data – keys are dynamic from API (e.g. Punches, identification) */
export type FighterData = {
  corner?: FighterCorner | null
  [key: string]: unknown
}

/** Timestamp arrays from report.performance (e.g. player_A_punches, player_B_punches) */
export type PerformanceTimestamp = {
  player_A_punches?: string[]
  player_B_punches?: string[]
  [key: string]: string[] | undefined
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
    name?: string
    performance: {
      fighter_A: FighterData
      fighter_B: FighterData
      timestamp?: PerformanceTimestamp
    }
    created_at: string
    updated_at: string
  }
}

/** Result shown after upload: API response + file name for display */
export type UploadResult = UploadVideoResponse & {
  fileName: string
}


