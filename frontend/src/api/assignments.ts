import { apiClient } from './client'
import type { Assignment, AssignmentPayload } from '../types/assignment'

export async function getAssignments() {
  const { data } = await apiClient.get<Assignment[]>('/assignments/')
  return data
}

export async function createAssignment(payload: AssignmentPayload) {
  const { data } = await apiClient.post<Assignment>('/assignments/', payload)
  return data
}

export async function updateAssignment(assignmentId: number, payload: AssignmentPayload) {
  const { data } = await apiClient.put<Assignment>(`/assignments/${assignmentId}`, payload)
  return data
}

export async function deleteAssignment(assignmentId: number) {
  await apiClient.delete(`/assignments/${assignmentId}`)
}
