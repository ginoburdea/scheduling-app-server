import { PrismaService } from '@/utils/prisma.service'
import { BadRequestException, Injectable } from '@nestjs/common'
import * as dayjs from 'dayjs'
import { calendarsErrors } from './calendars.errors'
import { PartialCalendar } from './dto/updateCalendar.dto'
import * as aes from 'crypto-js/aes'

@Injectable()
export class CalendarsService {
    constructor(private prisma: PrismaService) {}

    private militaryTimeToDate(time: string, day: Date) {
        const [hour, minute] = time.split(':').map(str => +str)

        return dayjs(day)
            .set('hour', hour)
            .set('minute', minute)
            .startOf('minute')
            .toDate()
    }

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

        const openingTime = this.militaryTimeToDate(
            calendar.dayStartsAt,
            selectedDay.toDate()
        )
        const closingTime = this.militaryTimeToDate(
            calendar.dayEndsAt,
            selectedDay.toDate()
        )

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

    async setAppointment(
        calendarId: string,
        date: Date,
        name: string,
        phoneNumber: string
    ) {
        const calendar = await this.prisma.calendars.findFirst({
            where: { publicId: calendarId },
            select: {
                id: true,
                bookingDuration: true,
                breakBetweenBookings: true,
                dayStartsAt: true,
                dayEndsAt: true,
                workingDays: true,
            },
        })
        if (!calendar) {
            throw new BadRequestException(
                calendarsErrors.setAppointment.calendarNotFound
            )
        }

        const selectedDay = dayjs(date)
        if (!calendar.workingDays.includes(selectedDay.get('day'))) {
            throw new BadRequestException(
                calendarsErrors.setAppointment.cannotBookOnNonWorkingDay
            )
        }

        const openingTime = this.militaryTimeToDate(calendar.dayStartsAt, date)
        const closingTime = this.militaryTimeToDate(calendar.dayEndsAt, date)

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

        const apps = [
            ...appointments,
            { onDate: openingTime },
            { onDate: closingTime },
            { onDate: date },
        ].sort((a, b) => +a.onDate - +b.onDate)

        const openingTimeIndex = apps.findIndex(
            app => app.onDate == openingTime
        )
        const closingTimeIndex = apps.findIndex(
            app => app.onDate == closingTime
        )
        const currentTimeIndex = apps.findIndex(app => app.onDate == date)

        if (
            currentTimeIndex < openingTimeIndex ||
            currentTimeIndex > closingTimeIndex
        ) {
            throw new BadRequestException(
                calendarsErrors.setAppointment.cannotBookOutsideBusinessHours
            )
        }

        const previousTime = apps[currentTimeIndex - 1].onDate
        const nextTime = apps[currentTimeIndex + 1].onDate

        const trueAppointmentLength =
            calendar.bookingDuration + calendar.breakBetweenBookings
        if (
            dayjs(date).add(trueAppointmentLength, 'minutes').isAfter(nextTime)
        ) {
            throw new BadRequestException(
                calendarsErrors.setAppointment.tooLate
            )
        }

        for (let i = 0; true; i++) {
            const temp = dayjs(previousTime)
                .add(i * trueAppointmentLength, 'minutes')
                .toDate()

            if (+temp - +date === 0) break
            if (+temp > +date) {
                throw new BadRequestException(
                    calendarsErrors.setAppointment.cannotBookAnyTime
                )
            }
        }

        const hashedPhoneNumber = aes
            .encrypt(phoneNumber, process.env.DATABASE_ENCRYPTION_KEY)
            .toString()
        await this.prisma.appointments.create({
            data: {
                calendarId: calendar.id,
                clientName: name,
                clientPhoneNumber: hashedPhoneNumber,
                onDate: date,
                duration: calendar.bookingDuration,
            },
        })

        return { name, phoneNumber, date }
    }

    async getAppointments(calendarId: number, month: number, year: number) {
        const date = dayjs()
            .set('month', month - 1)
            .set('year', year)

        const appointments = await this.prisma.appointments.findMany({
            where: {
                calendarId,
                onDate: {
                    gte: date.startOf('month').toDate(),
                    lte: date.endOf('month').toDate(),
                },
            },
            select: {
                id: true,
                onDate: true,
                duration: true,
            },
        })

        const groups = {}
        for (const appointment of appointments) {
            const dateStr = dayjs(appointment.onDate).format('YYYY-MM-DD')

            if (!groups[dateStr]) groups[dateStr] = []
            groups[dateStr].push({
                id: appointment.id,
                startsAt: appointment.onDate,
                endsAt: dayjs(appointment.onDate)
                    .add(appointment.duration, 'minutes')
                    .toDate(),
            })
        }

        return {
            appointments: Object.keys(groups).map(key => ({
                day: key,
                appointments: groups[key],
            })),
        }
    }

    async getAppointmentInfo(calendarId: number, appointmentId: number) {
        const appointment = await this.prisma.appointments.findFirst({
            where: { id: appointmentId, calendarId },
            select: { clientName: true, clientPhoneNumber: true },
        })
        if (!appointment) {
            throw new BadRequestException(
                calendarsErrors.getAppointmentInfo.appointmentNotFound
            )
        }

        return { ...appointment }
    }
}
