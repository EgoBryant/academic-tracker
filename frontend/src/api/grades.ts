import { apiClient } from './client'
import type { Grade, GradePayload } from '../types/grade'

export async function getGrades(subjectId: number) {
  const { data } = await apiClient.get<Grade[]>(`/subjects/${subjectId}/grades`)
  return data
}

export async function createGrade(subjectId: number, payload: GradePayload) {
  const { data } = await apiClient.post<Grade>(`/subjects/${subjectId}/grades`, payload)
  return data
}

export async function updateGrade(gradeId: number, payload: GradePayload) {
  const { data } = await apiClient.put<Grade>(`/grades/${gradeId}`, payload)
  return data
}

export async function deleteGrade(gradeId: number) {
  await apiClient.delete(`/grades/${gradeId}`)
}
