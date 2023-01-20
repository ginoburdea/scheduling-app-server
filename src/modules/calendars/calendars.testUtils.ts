import { PrismaService } from '@/utils/prisma.service'
import { faker } from '@faker-js/faker'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { PartialCalendar } from './dto/updateCalendar.dto'
import * as dayjs from 'dayjs'

const genCalendarUpdates = ({
    businessName = faker.company.name(),
    businessDescription = faker.company.catchPhrase(),
    dayStartsAt = '08:00',
    dayEndsAt = '16:00',
    breakBetweenBookings = 15,
    bookingDuration = 45,
    bookInAdvance = 7,
    workingDays = [0, 1, 2, 3, 4, 5],
} = {}): PartialCalendar => ({
    businessName,
    businessDescription,
    dayStartsAt,
    dayEndsAt,
    breakBetweenBookings,
    bookingDuration,
    bookInAdvance,
    workingDays,
})

export const updateCalendar = async (
    app: NestFastifyApplication,
    sessionId: string,
    calendarId: string,
    calendarUpdates = genCalendarUpdates()
): Promise<[string, number]> => {
    const res = await app.inject({
        method: 'PUT',
        url: '/calendars',
        payload: {
            id: calendarId,
            updates: calendarUpdates,
        },
        headers: {
            authorization: `Bearer ${sessionId}`,
        },
    })

    return [res.json(), res.statusCode]
}

export const getCalendarId = async (
    prisma: PrismaService,
    email: string
): Promise<[string, number]> => {
    const user = await prisma.users.findFirst({
        where: { email },
        select: { calendars: { select: { publicId: true, id: true } } },
    })
    return [user.calendars[0].publicId, user.calendars[0].id]
}

export const getCalendarInfo = async (
    app: NestFastifyApplication,
    calendarId: string
) => {
    const res = await app.inject({
        method: 'GET',
        url: '/calendars',
        query: {
            id: calendarId,
        },
    })

    return [res.json(), res.statusCode]
}

export const getAvailableDays = async (
    app: NestFastifyApplication,
    calendarId: string
) => {
    const res = await app.inject({
        method: 'GET',
        url: '/calendars/available-days',
        query: { calendarId },
    })

    return [res.json(), res.statusCode]
}

export const genAppointmentData = (
    calendarId: number,
    date: Date,
    minHour = 0
) => ({
    calendarId,
    clientName: faker.name.fullName(),
    clientPhoneNumber: faker.phone.number(),
    duration: 25,
    onDate: dayjs(date)
        .set('hour', faker.datatype.number({ min: minHour, max: 23 }))
        .set('minutes', faker.datatype.number({ max: 59, precision: 15 }))
        .toDate(),
})

export const getAvailableSpots = async (
    app: NestFastifyApplication,
    calendarId: string,
    date: Date = new Date()
) => {
    const res = await app.inject({
        method: 'GET',
        url: '/calendars/available-spots',
        query: {
            calendarId,
            date: date.toISOString(),
        },
    })

    return [res.json(), res.statusCode]
}

export const setAppointments = async (
    prisma: PrismaService,
    calendarId: number,
    date: Date,
    minHour?: number
) => {
    await prisma.appointments.createMany({
        data: Array(10)
            .fill(null)
            .map(() => genAppointmentData(calendarId, date, minHour)),
    })
}

export const setAppointment = async (
    app: NestFastifyApplication,
    calendarId: string,
    date: Date = new Date()
) => {
    const res = await app.inject({
        method: 'POST',
        url: '/calendars/set-appointment',
        payload: {
            calendarId,
            date,
            name: faker.name.fullName(),
            phoneNumber: faker.phone.number(),
        },
    })

    return [res.json(), res.statusCode]
}

export const getNextMonday = () =>
    dayjs().startOf('week').add(1, 'week').toDate()

export const getNextSaturday = () =>
    dayjs().startOf('week').add(6, 'days').toDate()
