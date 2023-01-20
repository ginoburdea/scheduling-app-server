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
}
