import { useState, useRef } from 'react'
import { ArrowLeft, Upload, FileVideo, X, Loader2 } from 'lucide-react'
import { useToast } from '../../../contexts/ToastContext'
import type { UploadVideoResponse } from '../types'
import { uploadVideo } from '../api'

type VideoUploadProps = {
  onAnalyzed: (result: UploadVideoResponse, file: File) => void
  onBack?: () => void
}

function VideoUpload({ onAnalyzed, onBack }: VideoUploadProps) {
  const toast = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (selected: File | null): void => {
    setFile(selected)
    setError(null)
  }

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const selected = event.target.files?.[0] ?? null
    handleFileChange(selected)
  }

  const onZoneClick = () => {
    if (isUploading) return
    inputRef.current?.click()
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isUploading) return
    setIsDragOver(true)
  }

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    if (isUploading) return
    const f = e.dataTransfer.files?.[0]
    if (f?.type.startsWith('video/')) {
      handleFileChange(f)
    } else if (f) {
      setError('Please choose a video file (e.g. MP4, WebM).')
    }
  }

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation()
    handleFileChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const startUpload = async () => {
    if (!file) {
      setError('Please choose a video file to upload.')
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      const result = await uploadVideo(file, () => {})
      onAnalyzed(result, file)
      toast.success('Video uploaded successfully')
    } catch (uploadError) {
      const message =
        uploadError && typeof uploadError === 'object' && 'response' in uploadError
          ? (uploadError as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : null
      setError(
        message ||
          (uploadError instanceof Error
            ? uploadError.message
            : 'Something went wrong while uploading the video.'),
      )
    } finally {
      setIsUploading(false)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  return (
    <div className="app-page video-upload-page bg-white py-10">
      <div className="upload-content">
        <header className="upload-header">
          {onBack && (
            <button
              type="button"
              className="upload-back-link"
              onClick={onBack}
            >
              <ArrowLeft size={18} strokeWidth={2} aria-hidden />
              <span>Back</span>
            </button>
          )}
          <p className="text-[11px] font-semibold tracking-[0.25em] text-sky-200 uppercase">
            Upload video
          </p>
          <h2 className="mt-1.5 text-2xl md:text-3xl font-semibold tracking-tight text-white">
            Upload your session footage
          </h2>
          <p className="mt-1 text-sm text-slate-200/90 max-w-xl">
            Choose an athlete video for this session. We&apos;ll process it and
            generate performance metrics based on your selected sport and focus.
          </p>
        </header>

        <div className="upload-body">
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            onChange={onInputChange}
            disabled={isUploading}
            className="upload-input-hidden"
            aria-label="Choose video file"
          />

          {!file ? (
            <button
              type="button"
              className={`upload-zone ${isDragOver ? 'upload-zone--drag-over' : ''} ${isUploading ? 'upload-zone--disabled' : ''}`}
              onClick={onZoneClick}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              disabled={isUploading}
            >
              <span className="upload-zone-icon" aria-hidden>
                <Upload size={40} strokeWidth={1.5} />
              </span>
              <span className="upload-zone-primary">
                {isDragOver ? 'Drop video here' : 'Drop your video here'}
              </span>
              <span className="upload-zone-secondary">
                or click to browse from your device
              </span>
              <span className="upload-zone-hint">MP4, WebM, or other video files</span>
            </button>
          ) : (
            <div className="upload-file-card">
              <span className="upload-file-icon" aria-hidden>
                <FileVideo size={24} strokeWidth={1.5} />
              </span>
              <div className="upload-file-details">
                <span className="upload-file-name" title={file.name}>
                  {file.name}
                </span>
                <span className="upload-file-size">{formatSize(file.size)}</span>
              </div>
              {!isUploading && (
                <button
                  type="button"
                  className="upload-file-clear"
                  onClick={clearFile}
                  aria-label="Remove file"
                >
                  <X size={18} strokeWidth={2} />
                </button>
              )}
            </div>
          )}

          {error && (
            <div className="upload-error" role="alert">
              {error}
            </div>
          )}

          {file && (
            <button
              type="button"
              className="upload-submit primary-button"
              onClick={startUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2
                    size={18}
                    strokeWidth={2.5}
                    className="upload-button-spinner"
                    aria-hidden
                  />
                  Uploading…
                </>
              ) : (
                'Upload & Generate'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default VideoUpload
