import apiClient from '../../api/client'
import type { FighterData, UploadResult } from '../upload/types'
import { normalizePerformance } from '../upload/api'

/** Single report from GET /dash/user-id – performance may be array or object */
export type UserHistoryReport = {
  _id: string
  user_id: string
  sport: string
  name?: string
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
  const response = await apiClient.get<UserHistoryResponse | UserHistoryReport[]>('/reports')
  const data = response.data
  if (Array.isArray(data)) return data
  const list = data?.result ?? data?.reports ?? data?.data ?? []
  return Array.isArray(list) ? list : []
}

/** Delete reports by IDs. Body: string[] */
export async function deleteReports(reportIds: string[]): Promise<void> {
  if (reportIds.length === 0) return
  await apiClient.delete('reports', { data: reportIds as unknown as string[] })
}

/** Map API report to UploadResult for History/MetricsView; normalizes player_A/B and timestamp */
export function mapHistoryReportToUploadResult(report: UserHistoryReport): UploadResult {
  const dateLabel = formatReportDate(report?.created_at ?? '')
  const sport = report?.sport ?? 'Session'
  const fileName = report?.name
    ? `${report.name} – ${sport} – ${dateLabel}`
    : `${sport} – ${dateLabel}`
  const perf = normalizePerformance(report?.performance)
  return {
    message: '',
    user_id: report?.user_id ?? '',
    response: { fighter_A: perf.fighter_A, fighter_B: perf.fighter_B },
    report: {
      _id: report?._id ?? '',
      user_id: report?.user_id ?? '',
      sport: report?.sport ?? '',
      name: report?.name,
      performance: {
        fighter_A: perf.fighter_A,
        fighter_B: perf.fighter_B,
        timestamp: perf.timestamp,
      },
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
