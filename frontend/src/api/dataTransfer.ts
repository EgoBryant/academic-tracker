import { dataClient } from './client'
import type { ExportFormat, ImportResult } from '../types/dataTransfer'

export async function exportUserData(format: ExportFormat) {
  const { data, headers } = await dataClient.get<Blob>(`/data/export/${format}`, {
    responseType: 'blob',
  })

  return {
    file: data,
    fileName: getFileName(headers['content-disposition']) ?? `academic_backup.${format === 'csv' ? 'zip' : 'xlsx'}`,
  }
}

export async function importUserData(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const { data } = await dataClient.post<ImportResult>('/data/import', formData)
  return data
}

function getFileName(contentDisposition?: string) {
  if (!contentDisposition) {
    return null
  }

  const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/)
  return fileNameMatch?.[1] ?? null
}
