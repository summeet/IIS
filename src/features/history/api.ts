import apiClient from '../../api/client'
import type { FighterData, UploadResult } from '../upload/types'

/** Single report from GET /dash/user-id result array */
export type UserHistoryReport = {
  _id: string
  user_id: string
  sport: string
  performance: {
    fighter_A: FighterData
    fighter_B: FighterData
  }
  created_at: string
  updated_at: string
}

export type UserHistoryResponse = {
  user_id: string
  result?: UserHistoryReport[]
  reports?: UserHistoryReport[]
  data?: UserHistoryReport[]
}

export async function getUserHistory(): Promise<UserHistoryReport[]> {
  const response = await apiClient.get<UserHistoryResponse | UserHistoryReport[]>('/dash/user-id')
  const data = response.data
  if (Array.isArray(data)) return data
  const list = data?.result ?? data?.reports ?? data?.data ?? []
  return Array.isArray(list) ? list : []
}

/** Map API report to UploadResult for History/MetricsView */
export function mapHistoryReportToUploadResult(report: UserHistoryReport): UploadResult {
  const dateLabel = formatReportDate(report?.created_at ?? '')
  const sport = report?.sport ?? 'Session'
  const fileName = `${sport} – ${dateLabel}`
  const performance = report?.performance ?? {}
  const fighter_A = performance?.fighter_A ?? null
  const fighter_B = performance?.fighter_B ?? null
  return {
    message: '',
    user_id: report?.user_id ?? '',
    response: {
      fighter_A: fighter_A as import('../upload/types').FighterData,
      fighter_B: fighter_B as import('../upload/types').FighterData,
    },
    report: {
      _id: report?._id ?? '',
      user_id: report?.user_id ?? '',
      sport: report?.sport ?? '',
      performance: report?.performance ?? { fighter_A: null, fighter_B: null },
      created_at: report?.created_at ?? '',
      updated_at: report?.updated_at ?? '',
    },
    fileName,
  }
}

export function hasFighterData(item: UploadResult): boolean {
  return (
    item?.response?.fighter_A != null && item?.response?.fighter_B != null
  )
}

function formatReportDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}
