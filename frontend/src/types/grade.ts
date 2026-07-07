export interface Grade {
  grade_id: number
  subject_id: number
  grade_value: string
  description: string
  graded_at: string
}

export interface GradePayload {
  grade_value: string
  description: string
  graded_at: string
}
