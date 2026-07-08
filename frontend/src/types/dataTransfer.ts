export type ExportFormat = 'xlsx' | 'csv'

export interface ImportResult {
  status: string
  imported_subjects: number
  imported_grades: number
  imported_assignments: number
  logs: string[]
}
