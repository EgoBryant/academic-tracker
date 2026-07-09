import type { Assignment } from '../types/assignment'

export interface CalendarDay {
  date: Date
  dateKey: string
  muted: boolean
  today: boolean
  assignments: Assignment[]
}

export function buildCalendarDays(visibleDate: Date, assignments: Assignment[]) {
  const year = visibleDate.getFullYear()
  const month = visibleDate.getMonth()
  const firstMonthDay = new Date(year, month, 1)
  const firstGridDay = new Date(firstMonthDay)
  const mondayOffset = (firstMonthDay.getDay() + 6) % 7
  firstGridDay.setDate(firstMonthDay.getDate() - mondayOffset)

  const todayKey = getDateKey(new Date())
  const assignmentsByDate = assignments.reduce<Record<string, Assignment[]>>((result, assignment) => {
    const dateKey = getDateKey(parseDateTime(assignment.due_datetime))
    result[dateKey] = [...(result[dateKey] ?? []), assignment]
    return result
  }, {})

  return Array.from({ length: 35 }, (_, index): CalendarDay => {
    const date = new Date(firstGridDay)
    date.setDate(firstGridDay.getDate() + index)
    const dateKey = getDateKey(date)

    return {
      date,
      dateKey,
      muted: date.getMonth() !== month,
      today: dateKey === todayKey,
      assignments: assignmentsByDate[dateKey] ?? [],
    }
  })
}

export function getDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseDateTime(value: string) {
  const normalizedValue = value.includes('T') ? value : value.replace(' ', 'T')
  const parsedDate = new Date(normalizedValue)

  if (Number.isNaN(parsedDate.getTime())) {
    return new Date()
  }

  return parsedDate
}

export function formatDateInput(date: Date) {
  return getDateKey(date)
}

export function formatTimeInput(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export function buildDueDateTime(date: string, time: string) {
  return `${date}T${time}:00`
}

export function getAssignmentTone(index: number) {
  const tones = ['yellow', 'blue', 'red'] as const
  return tones[index % tones.length]
}
