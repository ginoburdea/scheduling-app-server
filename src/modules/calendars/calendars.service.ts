import { PrismaService } from '@/utils/prisma.service'
import { BadRequestException, Injectable } from '@nestjs/common'
import * as dayjs from 'dayjs'
import { calendarsErrors } from './calendars.errors'
import { PartialCalendar } from './dto/updateCalendar.dto'

@Injectable()
export class CalendarsService {
    constructor(private prisma: PrismaService) {}

    async updateCalendar(
        calendarPublicId: string,
        updates: PartialCalendar,
        userId: number
    ) {
        const calendar = await this.prisma.calendars.findFirst({
            where: { publicId: calendarPublicId },
            select: { id: true, userId: true },
        })
        if (!calendar) {
            throw new BadRequestException(
                calendarsErrors.updateCalendar.calendarNotFound
            )
        }
        if (calendar.userId !== userId) {
            throw new BadRequestException(
                calendarsErrors.updateCalendar.cannotUpdateCalendar
            )
        }

        const updatedCalendar = await this.prisma.calendars.update({
            where: { id: calendar.id },
            data: updates,
        })
        return {
            ...updatedCalendar,
            updatedAt: undefined,
            createdAt: undefined,
            userId: undefined,
            publicId: undefined,
            id: undefined,
        }
    }

    async getCalendarInfo(calendarPublicId: string) {
        const calendar = await this.prisma.calendars.findFirst({
            where: { publicId: calendarPublicId },
            select: { businessName: true, businessDescription: true },
        })
        if (!calendar) {
            throw new BadRequestException(
                calendarsErrors.getCalendarInfo.calendarNotFound
            )
        }

        return { ...calendar }
    }

    async getAvailableDays(calendarPublicId: string) {
        const calendar = await this.prisma.calendars.findFirst({
            where: { publicId: calendarPublicId },
            select: {
                id: true,
                bookInAdvance: true,
                workingDays: true,
            },
        })
        if (!calendar) {
            throw new BadRequestException(
                calendarsErrors.getAvailableDays.calendarNotFound
            )
        }

        const today = dayjs().startOf('day')
        const availableDays = []
        for (let i = 0; i < calendar.bookInAdvance; i++) {
            const currentDay = today.add(i, 'days')

            if (calendar.workingDays.includes(currentDay.get('day'))) {
                availableDays.push(currentDay.toDate())
            }
        }

        return { dates: availableDays }
    }

    async getAvailableSpots(calendarPublicId: string, day: Date | string) {
        const calendar = await this.prisma.calendars.findFirst({
            where: { publicId: calendarPublicId },
            select: {
                id: true,
                dayStartsAt: true,
                dayEndsAt: true,
                bookingDuration: true,
                breakBetweenBookings: true,
                workingDays: true,
            },
        })
        if (!calendar) {
            throw new BadRequestException(
                calendarsErrors.getAvailableSpots.calendarNotFound
            )
        }

        const selectedDay = dayjs(day)
        if (!calendar.workingDays.includes(selectedDay.get('day'))) {
            return { spots: [] }
        }

        const appointments = await this.prisma.appointments.findMany({
            where: {
                onDate: {
                    gte: selectedDay.startOf('day').toDate(),
                    lte: selectedDay.endOf('day').toDate(),
                },
                calendarId: calendar.id,
            },
            select: { onDate: true, duration: true },
            orderBy: { onDate: 'asc' },
        })
        if (appointments.length === 0) return { spots: [] }

        const [openingHour, openingMinute] = calendar.dayStartsAt
            .split(':')
            .map(str => +str)
        const openingTime = dayjs(appointments[0].onDate)
            .set('hour', openingHour)
            .set('minute', openingMinute)
            .startOf('minute')
            .toDate()

        const [closingHour, closingMinute] = calendar.dayEndsAt
            .split(':')
            .map(str => +str)
        const closingTime = dayjs(appointments[appointments.length - 1].onDate)
            .set('hour', closingHour)
            .set('minute', closingMinute)
            .startOf('minute')
            .toDate()

        const trueAppointmentLength =
            calendar.bookingDuration + calendar.breakBetweenBookings
        const spots: Date[] = []
        for (let i = 0; i < appointments.length; i++) {
            const app = appointments[i]
            const tempCurrent = dayjs(app.onDate)
                .add(app.duration, 'minutes')
                .add(calendar.breakBetweenBookings, 'minutes')
                .toDate()

            const current =
                tempCurrent < openingTime ? openingTime : tempCurrent

            const tempNext = appointments[i + 1]
            const next =
                tempNext && tempNext.onDate < closingTime
                    ? tempNext.onDate
                    : closingTime

            const minutesUntilNextApp = (+next - +current) / (1000 * 60)
            const spotsCount = minutesUntilNextApp / trueAppointmentLength
            for (let j = 0; j < spotsCount; j++) {
                spots.push(
                    dayjs(current)
                        .add(j * trueAppointmentLength, 'minutes')
                        .toDate()
                )
            }
        }

        return { spots }
    }
}
