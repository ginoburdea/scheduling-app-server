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

    async getCalendarSettings(calendarId: number) {
        const calendar = await this.prisma.calendars.findFirst({
            where: { id: calendarId },
            select: {
                businessName: true,
                businessDescription: true,
                dayStartsAt: true,
                dayEndsAt: true,
                breakBetweenBookings: true,
                bookingDuration: true,
                bookInAdvance: true,
                workingDays: true,
            },
        })

        return { ...calendar }
    }

    async updateCalendar(calendarId: number, updates: PartialCalendar) {
        const updatedCalendar = await this.prisma.calendars.update({
            where: { id: calendarId },
            data: updates,
            select: {
                businessName: true,
                businessDescription: true,
                dayStartsAt: true,
                dayEndsAt: true,
                breakBetweenBookings: true,
                bookingDuration: true,
                bookInAdvance: true,
                workingDays: true,
            },
        })

        return { ...updatedCalendar }
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

        const openingTime = this.militaryTimeToDate(
            calendar.dayStartsAt,
            selectedDay.toDate()
        )
        const closingTime = this.militaryTimeToDate(
            calendar.dayEndsAt,
            selectedDay.toDate()
        )

        const apps = [
            {
                onDate: dayjs(openingTime)
                    .subtract(calendar.bookingDuration, 'minutes')
                    .toDate(),
                duration: 0,
            },
            ...appointments,
            {
                onDate: closingTime,
                duration: 0,
            },
        ]

        const trueAppointmentLength =
            calendar.bookingDuration + calendar.breakBetweenBookings
        const spots: Date[] = []
        for (let i = 0; i < apps.length; i++) {
            const app = apps[i]
            const tempCurrent = dayjs(app.onDate)
                .add(app.duration, 'minutes')
                .add(calendar.breakBetweenBookings, 'minutes')
                .toDate()

            const current =
                tempCurrent < openingTime ? openingTime : tempCurrent

            const tempNext = apps[i + 1]
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
            .encrypt(phoneNumber, process.env.SERVER_DATABASE_ENCRYPTION_KEY)
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

    async getAppointments(
        calendarId: number,
        atOrAfter: Date,
        atOrBefore: Date
    ) {
        if (dayjs(atOrBefore).diff(atOrAfter, 'days') > 7) {
            throw new BadRequestException(
                calendarsErrors.getAppointments.intervalTooBig
            )
        }

        const appointments = await this.prisma.appointments.findMany({
            where: {
                calendarId,
                onDate: { gte: atOrAfter, lte: atOrBefore },
            },
            select: { id: true, onDate: true, duration: true },
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
