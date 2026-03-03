import apiClient from '../../../api/client'

/** Matrix record: key -> description */
export type MatrixRecord = Record<string, string>

/** API matrix document (from GET) */
export type MatrixDoc = {
  _id: string
  sport: string
  matrix: MatrixRecord
  user_id?: string
  created_at?: string
  updated_at?: string
}

/** Create matrix payload */
export type CreateMatrixPayload = {
  sport: string
  matrix: MatrixRecord
}

/** Update matrix payload */
export type UpdateMatrixPayload = {
  sport: string
  matrix: string[] | MatrixRecord
}

export async function getMatricesBySport(sport: string): Promise<MatrixDoc | MatrixDoc[] | null> {
  try {
    const response = await apiClient.get<MatrixDoc | MatrixDoc[]>(`/matrices/sport/${sport}`)
    return response.data
  } catch (err) {
    if (err && typeof err === 'object' && 'response' in err) {
      const status = (err as { response?: { status?: number } }).response?.status
      if (status === 404) return null
    }
    throw err
  }
}

export async function getAllMatrices(): Promise<MatrixDoc[]> {
  const response = await apiClient.get<MatrixDoc[] | { matrices?: MatrixDoc[] }>('/matrices/')
  const data = response.data
  if (Array.isArray(data)) return data
  return (data as { matrices?: MatrixDoc[] }).matrices ?? []
}

export async function getMatrixById(id: string): Promise<MatrixDoc> {
  const response = await apiClient.get<MatrixDoc>(`/matrices/${id}`)
  return response.data
}

export async function createMatrix(payload: CreateMatrixPayload): Promise<MatrixDoc> {
  const response = await apiClient.post<MatrixDoc>('/matrices/', payload)
  return response.data
}

export async function updateMatrix(id: string, payload: UpdateMatrixPayload): Promise<MatrixDoc> {
  const response = await apiClient.put<MatrixDoc>(`/matrices/${id}`, payload)
  return response.data
}

export async function deleteMatrix(id: string): Promise<void> {
  await apiClient.delete(`/matrices/${id}`)
}
