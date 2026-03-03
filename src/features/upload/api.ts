import apiClient from '../../api/client'
import type { FighterData, UploadVideoResponse } from './types'

/** Video upload endpoint – update if backend path changed */
const UPLOAD_VIDEO_ENDPOINT = '/video/upload'

/** FormData field name for the video file – use 'file' or 'video' per backend */
const UPLOAD_VIDEO_FILE_FIELD = 'video'

/** API may return response/performance as array [{ fighter_A }, { fighter_B }]; normalize to object */
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
        if ('fighter_A' in item && item.fighter_A != null) out.fighter_A = item.fighter_A as FighterData
        if ('fighter_B' in item && item.fighter_B != null) out.fighter_B = item.fighter_B as FighterData
      }
    }
    return out
  }
  if (value && typeof value === 'object') {
    const o = value as Record<string, unknown>
    if (o.fighter_A != null) out.fighter_A = o.fighter_A as FighterData
    if (o.fighter_B != null) out.fighter_B = o.fighter_B as FighterData
  }
  return out
}

const emptyFighter: FighterData = {}

/** Normalize upload API response so response/performance are always { fighter_A, fighter_B } */
export function normalizeUploadVideoResponse(
  data: Record<string, unknown>,
): UploadVideoResponse {
  if (!data || typeof data !== 'object') {
    data = {}
  }
  const responseNorm = normalizeFighterPair(data?.response)
  const report = (data?.report ?? {}) as Record<string, unknown>
  const performanceNorm = normalizeFighterPair(report?.performance)
  return {
    message: String(data?.message ?? ''),
    user_id: String(data?.user_id ?? ''),
    response: {
      fighter_A: responseNorm.fighter_A ?? emptyFighter,
      fighter_B: responseNorm.fighter_B ?? emptyFighter,
    },
    report: {
      _id: String(report?._id ?? ''),
      user_id: String(report?.user_id ?? ''),
      sport: String(report?.sport ?? ''),
      performance: {
        fighter_A: performanceNorm.fighter_A ?? emptyFighter,
        fighter_B: performanceNorm.fighter_B ?? emptyFighter,
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
