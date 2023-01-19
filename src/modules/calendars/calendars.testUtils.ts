import { PrismaService } from '@/utils/prisma.service'
import { faker } from '@faker-js/faker'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { PartialCalendar } from './dto/updateCalendar.dto'

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

export const getCalendarId = async (prisma: PrismaService, email: string) => {
    const user = await prisma.users.findFirst({
        where: { email },
        select: { calendars: { select: { publicId: true } } },
    })
    return user.calendars[0].publicId
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
