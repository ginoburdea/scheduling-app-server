export const calendarsErrors = {
    updateCalendar: {
        calendarNotFound: 'calendar not found',
        cannotUpdateCalendar: 'you cannot update this calendar',
    },
    getCalendarInfo: {
        calendarNotFound: 'calendar not found',
    },
    getAvailableDays: {
        calendarNotFound: 'calendar not found',
    },
    getAvailableSpots: {
        calendarNotFound: 'calendar not found',
    },
    setAppointment: {
        calendarNotFound: 'calendar not found',
        cannotBookOnNonWorkingDay:
            'cannot book an appointment because on a non-working day',
        cannotBookOutsideBusinessHours:
            'cannot book an appointment outside of business hours',
        tooLate: 'cannot book at that time',
        cannotBookAnyTime: 'cannot book this time',
    },
}
