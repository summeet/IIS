import apiClient from '../../api/client'
import type { UploadVideoResponse } from './types'

export async function uploadVideo(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<UploadVideoResponse> {
  const formData = new FormData()
  formData.append('video', file)

  const response = await apiClient.post<UploadVideoResponse>(
    '/dash/upload-video',
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

  return response.data
}
