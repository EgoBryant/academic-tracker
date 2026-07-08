export interface Assignment {
  assignment_id: number
  subject_id: number
  title: string
  due_datetime: string
}

export interface AssignmentPayload {
  subject_id: number
  title: string
  due_datetime: string
}
