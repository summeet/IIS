import apiClient from '../../api/client'
import type { FighterData, UploadResult } from '../upload/types'
import { normalizeFighterPair } from '../upload/api'

/** Single report from GET /dash/user-id – performance may be array or object */
export type UserHistoryReport = {
  _id: string
  user_id: string
  sport: string
  performance?:
    | { fighter_A: FighterData; fighter_B: FighterData }
    | Array<{ fighter_A?: FighterData } | { fighter_B?: FighterData }>
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

/** Delete reports by IDs. Body: string[] */
export async function deleteReports(reportIds: string[]): Promise<void> {
  if (reportIds.length === 0) return
  await apiClient.post('/dash/delete-reports', reportIds)
}

const emptyFighter: FighterData = {
  corner: { corner_name: null, trunk_color_detected: null, confidence_score: null },
  total_punches: null,
  landed: null,
  accuracy: null,
  jabs: null,
  hooks: null,
  ring_control: null,
  distance_covered: null,
  blocks: null,
}

/** Map API report to UploadResult for History/MetricsView; normalizes performance if array */
export function mapHistoryReportToUploadResult(report: UserHistoryReport): UploadResult {
  const dateLabel = formatReportDate(report?.created_at ?? '')
  const sport = report?.sport ?? 'Session'
  const fileName = `${sport} – ${dateLabel}`
  const pair = normalizeFighterPair(report?.performance)
  const fighter_A = pair.fighter_A ?? emptyFighter
  const fighter_B = pair.fighter_B ?? emptyFighter
  return {
    message: '',
    user_id: report?.user_id ?? '',
    response: { fighter_A, fighter_B },
    report: {
      _id: report?._id ?? '',
      user_id: report?.user_id ?? '',
      sport: report?.sport ?? '',
      performance: { fighter_A, fighter_B },
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
