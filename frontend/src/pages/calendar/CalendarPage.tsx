type CalendarEventTone = 'yellow' | 'blue' | 'red'

interface CalendarEvent {
  label: string
  tone: CalendarEventTone
}

interface CalendarDay {
  day: string
  muted?: boolean
  today?: boolean
  events?: CalendarEvent[]
}

const weekDays = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС']

const calendarDays: CalendarDay[] = [
  { day: '28', muted: true },
  { day: '29', muted: true },
  { day: '30', muted: true },
  { day: '31', muted: true },
  { day: '1' },
  { day: '2', events: [{ label: '123', tone: 'yellow' }] },
  { day: '3' },
  { day: '4' },
  { day: '5' },
  { day: '6', events: [{ label: '123', tone: 'blue' }] },
  {
    day: '7',
    today: true,
    events: [
      { label: '123', tone: 'blue' },
      { label: '123', tone: 'red' },
    ],
  },
  { day: '8' },
  { day: '9' },
  { day: '10' },
  { day: '11' },
  { day: '12', events: [{ label: '123', tone: 'yellow' }] },
  { day: '13' },
  { day: '14' },
  { day: '15' },
  { day: '16', events: [{ label: '123', tone: 'blue' }] },
  { day: '17' },
  { day: '18' },
  { day: '19' },
  { day: '20' },
  { day: '21' },
  { day: '22' },
  { day: '23' },
  { day: '24' },
]

export function CalendarPage() {
  return (
    <section className="calendar-page">
      <header className="calendar-header">
        <h1>Календарь</h1>
        <p>Отслеживание мероприятий и дедлайнов по учебе</p>
      </header>

      <div className="calendar-board" aria-label="Календарь дедлайнов">
        <div className="calendar-weekdays">
          {weekDays.map((weekDay) => (
            <div className="calendar-weekday" key={weekDay}>
              {weekDay}
            </div>
          ))}
        </div>

        <div className="calendar-grid">
          {calendarDays.map((calendarDay, index) => (
            <article
              className={`calendar-day${calendarDay.muted ? ' calendar-day--muted' : ''}`}
              key={`${calendarDay.day}-${index}`}
            >
              <div className="calendar-day__top">
                <span className="calendar-day__number">{calendarDay.day}</span>
                {calendarDay.today && <span className="calendar-today">сегодня</span>}
              </div>

              {calendarDay.events && (
                <div className="calendar-events">
                  {calendarDay.events.map((event, eventIndex) => (
                    <span
                      className={`calendar-event calendar-event--${event.tone}`}
                      key={`${event.label}-${event.tone}-${eventIndex}`}
                    >
                      {event.label}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>

      <button className="calendar-fab" type="button" aria-label="Добавить дедлайн">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </section>
  )
}
