export interface Subject {
  subject_id: number
  subject_name: string
  teacher_name: string
  color: string
  user_id?: number
  average_grade?: number
  end_date?: string
}

export interface SubjectPayload {
  subject_name: string
  teacher_name: string
  color: string
  end_date?: string
}
