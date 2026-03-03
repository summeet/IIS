import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Upload, FileVideo, X, Loader2, ChevronDown, Check } from 'lucide-react'
import { useToast } from '../../../contexts/ToastContext'
import type { UploadVideoResponse } from '../types'
import { uploadVideo } from '../api'

const DEFAULT_PERSON_OPTIONS = [
  'Alex Johnson',
  'Jordan Smith',
  'Samantha Lee',
  'Riley Martinez',
  'Morgan Patel',
  'Casey Nguyen',
  'Taylor Brown',
  'Jamie Wilson',
  'Quinn Anderson',
  'Reese Thompson',
]

type VideoUploadProps = {
  onAnalyzed: (result: UploadVideoResponse, file: File) => void
  onBack?: () => void
  sport?: string
  metricKey?: string
  /** List of person names for the dropdown; user must select one before uploading */
  personNames?: string[]
}

function VideoUpload({ onAnalyzed, onBack, sport, metricKey, personNames = DEFAULT_PERSON_OPTIONS }: VideoUploadProps) {
  const toast = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [personName, setPersonName] = useState<string>('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      // Use capture so we run before any child stopPropagation
      document.addEventListener('mousedown', handleClickOutside, true)
      return () => document.removeEventListener('mousedown', handleClickOutside, true)
    }
  }, [dropdownOpen])

  const startUpload = async () => {
    if (!personName.trim()) {
      setError('Please select a person first.')
      return
    }
    if (!file) {
      setError('Please choose a video file to upload.')
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      const result = await uploadVideo(file, () => {}, {
        sport: sport ?? undefined,
        metric_key: metricKey ?? undefined,
        person_name: personName.trim(),
      })
      onAnalyzed(result, file)
      toast.success('Video uploaded successfully')
    } catch (uploadError) {
      let message: string | null = null
      if (uploadError && typeof uploadError === 'object' && 'response' in uploadError) {
        const res = (uploadError as { response?: { data?: unknown } }).response
        const detail = res?.data && typeof res.data === 'object' && 'detail' in res.data ? (res.data as { detail: unknown }).detail : null
        if (Array.isArray(detail) && detail.length > 0) {
          const first = detail[0]
          const msg = first && typeof first === 'object' && 'msg' in first ? String((first as { msg: string }).msg) : null
          const loc = first && typeof first === 'object' && 'loc' in first ? (first as { loc: unknown }).loc : null
          message = msg && Array.isArray(loc) ? `${msg} (${loc.join('.')})` : msg ?? JSON.stringify(detail)
        } else if (typeof detail === 'string') {
          message = detail
        }
      }
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
            {personName
              ? `Upload session footage for ${personName}`
              : 'Upload your session footage'}
          </h2>
          <p className="mt-1 text-sm text-slate-200/90 max-w-xl">
            {personName
              ? `Choose a video for ${personName}. We'll process it and generate performance metrics based on your selected sport and focus.`
              : 'Select a person above, then choose or drop a video. We\'ll process it and generate metrics based on your sport and focus.'}
          </p>
        </header>

        <div className="upload-body">
          <div className="upload-field" ref={dropdownRef}>
            <label className="upload-label">Person name</label>
            <div className="custom-dropdown">
              <button
                type="button"
                className={`custom-dropdown-trigger ${dropdownOpen ? 'custom-dropdown-trigger--open' : ''}`}
                onClick={() => !isUploading && setDropdownOpen((o) => !o)}
                disabled={isUploading}
                aria-expanded={dropdownOpen}
                aria-haspopup="listbox"
                aria-label="Select person"
                id="upload-person-name"
              >
                <span className={`custom-dropdown-value ${!personName ? 'custom-dropdown-value--placeholder' : ''}`}>
                  {personName || 'Select person'}
                </span>
                <ChevronDown
                  size={20}
                  strokeWidth={2}
                  className="custom-dropdown-chevron"
                  aria-hidden
                />
              </button>
              <div
                className={`custom-dropdown-panel ${dropdownOpen ? 'custom-dropdown-panel--open' : ''}`}
                role="listbox"
                aria-labelledby="upload-person-name"
              >
                {personNames.map((name) => (
                  <button
                    key={name}
                    type="button"
                    role="option"
                    aria-selected={personName === name}
                    className={`custom-dropdown-option ${personName === name ? 'custom-dropdown-option--selected' : ''}`}
                    onClick={() => {
                      setPersonName(name)
                      setError(null)
                      setDropdownOpen(false)
                    }}
                  >
                    <span>{name}</span>
                    {personName === name && (
                      <Check size={18} strokeWidth={2.5} className="custom-dropdown-check" aria-hidden />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

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
                {isDragOver
                  ? 'Drop video here'
                  : personName
                    ? `Drop ${personName}'s video here`
                    : 'Drop your video here'}
              </span>
              <span className="upload-zone-secondary">
                {personName
                  ? `or click to browse a video for ${personName}`
                  : 'or click to browse from your device'}
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
              disabled={isUploading || !personName.trim()}
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
                'Upload & generate'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default VideoUpload
