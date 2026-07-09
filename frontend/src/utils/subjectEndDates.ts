import type { Subject } from '../types/subject'

const SUBJECT_END_DATES_KEY = 'subject-end-dates'

type SubjectEndDates = Record<string, string>

export function mergeSubjectEndDates(subjects: Subject[]) {
  const storedDates = getSubjectEndDates()

  return subjects.map((subject) => ({
    ...subject,
    end_date: subject.end_date ?? storedDates[String(subject.subject_id)],
  }))
}

export function saveSubjectEndDate(subjectId: number, endDate: string) {
  const storedDates = getSubjectEndDates()
  storedDates[String(subjectId)] = endDate
  localStorage.setItem(SUBJECT_END_DATES_KEY, JSON.stringify(storedDates))
}

export function removeSubjectEndDate(subjectId: number) {
  const storedDates = getSubjectEndDates()
  delete storedDates[String(subjectId)]
  localStorage.setItem(SUBJECT_END_DATES_KEY, JSON.stringify(storedDates))
}

function getSubjectEndDates(): SubjectEndDates {
  const value = localStorage.getItem(SUBJECT_END_DATES_KEY)

  if (!value) {
    return {}
  }

  try {
    return JSON.parse(value) as SubjectEndDates
  } catch {
    localStorage.removeItem(SUBJECT_END_DATES_KEY)
    return {}
  }
}
