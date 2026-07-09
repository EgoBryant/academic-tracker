import { apiClient } from './client'
import type { Subject, SubjectPayload } from '../types/subject'

export async function getSubjects() {
  const { data } = await apiClient.get<Subject[]>('/subjects/')
  return data
}

export async function createSubject(payload: SubjectPayload) {
  const { data } = await apiClient.post<Subject>('/subjects/', toSubjectApiPayload(payload))
  return data
}

export async function updateSubject(subjectId: number, payload: SubjectPayload) {
  const { data } = await apiClient.put<Subject>(`/subjects/${subjectId}`, toSubjectApiPayload(payload))
  return data
}

export async function deleteSubject(subjectId: number) {
  await apiClient.delete(`/subjects/${subjectId}`)
}

function toSubjectApiPayload(payload: SubjectPayload) {
  return {
    subject_name: payload.subject_name,
    teacher_name: payload.teacher_name,
    color: payload.color,
  }
}
