import apiClient from '../../api/client'
import type { FighterData, PerformanceTimestamp, UploadVideoResponse } from './types'

/** Video upload endpoint – update if backend path changed */
const UPLOAD_VIDEO_ENDPOINT = '/video/upload'

/** FormData field name for the video file – use 'file' or 'video' per backend */
const UPLOAD_VIDEO_FILE_FIELD = 'video'

/** API may return fighter_A/B or player_A/B; array or object. Normalize to { fighter_A, fighter_B }. */
export function normalizeFighterPair(
  value: unknown,
): { fighter_A: FighterData | null; fighter_B: FighterData | null } {
  const out: { fighter_A: FighterData | null; fighter_B: FighterData | null } = {
    fighter_A: null,
    fighter_B: null,
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      if (item && typeof item === 'object') {
        const o = item as Record<string, unknown>
        if (o.fighter_A != null) out.fighter_A = o.fighter_A as FighterData
        if (o.fighter_B != null) out.fighter_B = o.fighter_B as FighterData
        if (o.player_A != null) out.fighter_A = o.player_A as FighterData
        if (o.player_B != null) out.fighter_B = o.player_B as FighterData
      }
    }
    return out
  }
  if (value && typeof value === 'object') {
    const o = value as Record<string, unknown>
    if (o.fighter_A != null) out.fighter_A = o.fighter_A as FighterData
    if (o.fighter_B != null) out.fighter_B = o.fighter_B as FighterData
    if (o.player_A != null) out.fighter_A = o.player_A as FighterData
    if (o.player_B != null) out.fighter_B = o.player_B as FighterData
  }
  return out
}

/** From report.performance get first report entry (player_A/player_B) and timestamp */
export function normalizePerformance(perf: unknown): {
  fighter_A: FighterData
  fighter_B: FighterData
  timestamp?: PerformanceTimestamp
} {
  const pair = normalizeFighterPair(perf)
  const fighter_A = pair.fighter_A ?? {}
  const fighter_B = pair.fighter_B ?? {}
  let timestamp: PerformanceTimestamp | undefined
  if (perf && typeof perf === 'object' && 'timestamp' in perf) {
    const t = (perf as Record<string, unknown>).timestamp
    if (t && typeof t === 'object' && !Array.isArray(t)) {
      timestamp = t as PerformanceTimestamp
    }
  }
  if (perf && typeof perf === 'object' && 'report' in perf) {
    const reportArr = (perf as Record<string, unknown>).report
    if (Array.isArray(reportArr) && reportArr.length > 0 && reportArr[0] && typeof reportArr[0] === 'object') {
      const first = normalizeFighterPair(reportArr[0])
      return {
        fighter_A: first.fighter_A ?? fighter_A,
        fighter_B: first.fighter_B ?? fighter_B,
        timestamp,
      }
    }
  }
  return { fighter_A, fighter_B, timestamp }
}

const emptyFighter: FighterData = {}

/** Normalize upload API response: player_A/B or fighter_A/B → fighter_A/B, keep timestamp */
export function normalizeUploadVideoResponse(
  data: Record<string, unknown>,
): UploadVideoResponse {
  if (!data || typeof data !== 'object') {
    data = {}
  }
  const report = (data?.report ?? {}) as Record<string, unknown>
  const performanceNorm = normalizePerformance(report?.performance)
  let responseNorm = normalizeFighterPair(data?.response)
  if (responseNorm.fighter_A == null && responseNorm.fighter_B == null && data?.response && typeof data.response === 'object') {
    const resp = data.response as Record<string, unknown>
    if (Array.isArray(resp.report) && resp.report.length > 0 && resp.report[0] != null) {
      const fromRespReport = normalizeFighterPair(resp.report[0])
      responseNorm = {
        fighter_A: fromRespReport.fighter_A ?? responseNorm.fighter_A,
        fighter_B: fromRespReport.fighter_B ?? responseNorm.fighter_B,
      }
    }
  }
  const responseFighterA = responseNorm.fighter_A ?? performanceNorm.fighter_A ?? emptyFighter
  const responseFighterB = responseNorm.fighter_B ?? performanceNorm.fighter_B ?? emptyFighter
  return {
    message: String(data?.message ?? ''),
    user_id: String(data?.user_id ?? ''),
    response: {
      fighter_A: responseFighterA,
      fighter_B: responseFighterB,
    },
    report: {
      _id: String(report?._id ?? ''),
      user_id: String(report?.user_id ?? ''),
      sport: String(report?.sport ?? ''),
      name: report?.name != null ? String(report.name) : undefined,
      performance: {
        fighter_A: performanceNorm.fighter_A ?? emptyFighter,
        fighter_B: performanceNorm.fighter_B ?? emptyFighter,
        timestamp: performanceNorm.timestamp,
      },
      created_at: String(report?.created_at ?? ''),
      updated_at: String(report?.updated_at ?? ''),
    },
  }
}

export async function uploadVideo(
  file: File,
  onProgress?: (percent: number) => void,
  payload?: { sport?: string; metric_key?: string; person_name?: string },
): Promise<UploadVideoResponse> {
  const formData = new FormData()
  formData.append(UPLOAD_VIDEO_FILE_FIELD, file)
  if (payload?.sport != null && payload.sport !== '') {
    formData.append('sport', payload.sport)
  }
  if (payload?.metric_key != null && payload.metric_key !== '') {
    formData.append('metric_key', payload.metric_key)
  }
  if (payload?.person_name != null && payload.person_name !== '') {
    formData.append('name', payload.person_name)
  }

  const response = await apiClient.post<Record<string, unknown>>(
    UPLOAD_VIDEO_ENDPOINT,
    formData,
    {
      onUploadProgress: (event) => {
        if (event.total != null && event.total > 0 && onProgress) {
          const percent = Math.round((event.loaded / event.total) * 100)
          onProgress(percent)
        }
      },
    },
  )

  return normalizeUploadVideoResponse(response.data)
}
