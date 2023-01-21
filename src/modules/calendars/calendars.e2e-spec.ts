import { PrismaService } from '@/utils/prisma.service'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { expect, describe, it, beforeAll } from '@jest/globals'
import { buildApp } from '@/utils/buildApp'
import { CalendarsModule } from './calendars.module'
import { registerUser } from '../users/users.testUtils'
import { UpdateCalendarRes } from './dto/updateCalendar.dto'
import {
    getAppointmentInfo,
    getAppointments,
    getAvailableDays,
    getAvailableSpots,
    getCalendarId,
    getCalendarInfo,
    getNextMonday,
    getNextSaturday,
    setAppointment,
    setAppointments,
    updateCalendar,
} from './calendars.testUtils'
import { faker } from '@faker-js/faker'
import { calendarsErrors } from './calendars.errors'
import { GetAvailableDaysRes } from './dto/getAvailableDays.dto'
import { GetCalendarInfoRes } from './dto/getCalendarInfo.dto'
import { GetAvailableSpotsRes } from './dto/getAvailableSpots.dto'
import * as dayjs from 'dayjs'
import { SetAppointmentRes } from './dto/setAppointment.dto'
import { GetAppointmentsRes } from './dto/getAppointments.dto'
import { GetAppointmentInfoRes } from './dto/getAppointmentInfo.dto'

describe('/calendars', () => {
    let app: NestFastifyApplication
    let prisma: PrismaService

    beforeAll(async () => {
        app = await buildApp(CalendarsModule)
        prisma = app.get<PrismaService>(PrismaService)

        await app.init()
        await app.getHttpAdapter().getInstance().ready()
    })

    describe('/ (PUT)', () => {
        it('Should update a calendar successfully', async () => {
            const [registerRes] = await registerUser(app)
            const [calendarId] = await getCalendarId(
                prisma,
                registerRes.userEmail
            )

            const [body, statusCode] = await updateCalendar(
                app,
                registerRes.session,
                calendarId
            )

            expect(statusCode).toEqual(200)
            await expect(body).toMatchDto(UpdateCalendarRes)
        })

        it('Should throw when the calendar does not exists', async () => {
            const [registerRes] = await registerUser(app)
            const fakeCalendarId = faker.datatype.uuid()

            const [body, statusCode] = await updateCalendar(
                app,
                registerRes.session,
                fakeCalendarId
            )

            expect(statusCode).toEqual(400)
            await expect(body).toMatchError(
                calendarsErrors.updateCalendar.calendarNotFound
            )
        })

        it('Should throw when the user does not own the calendar', async () => {
            const [registerRes1] = await registerUser(app)
            const [calendarId] = await getCalendarId(
                prisma,
                registerRes1.userEmail
            )

            const [registerRes2] = await registerUser(app)

            const [body, statusCode] = await updateCalendar(
                app,
                registerRes2.session,
                calendarId
            )

            expect(statusCode).toEqual(400)
            await expect(body).toMatchError(
                calendarsErrors.updateCalendar.cannotUpdateCalendar
            )
        })
    })

    describe('/ (GET)', () => {
        it('Should successfully get info about a calendar', async () => {
            const [registerRes] = await registerUser(app)
            const [calendarId] = await getCalendarId(
                prisma,
                registerRes.userEmail
            )

            const [body, statusCode] = await getCalendarInfo(app, calendarId)

            expect(statusCode).toEqual(200)
            await expect(body).toMatchDto(GetCalendarInfoRes)
        })

        it('Should throw when the calendar does not exists', async () => {
            const fakeCalendarId = faker.datatype.uuid()

            const [body, statusCode] = await getCalendarInfo(
                app,
                fakeCalendarId
            )

            expect(statusCode).toEqual(400)
            await expect(body).toMatchError(
                calendarsErrors.getCalendarInfo.calendarNotFound
            )
        })
    })

    describe('/available-days (GET)', () => {
        it('Should get available days', async () => {
            const [registerRes] = await registerUser(app)
            const [publicCalendarId] = await getCalendarId(
                prisma,
                registerRes.userEmail
            )

            const [body, statusCode] = await getAvailableDays(
                app,
                publicCalendarId
            )

            expect(statusCode).toEqual(200)
            await expect(body).toMatchDto(GetAvailableDaysRes)
        })

        it('Should throw when the calendar does not exist', async () => {
            const fakeCalendarId = faker.datatype.uuid()

            const [body, statusCode] = await getAvailableDays(
                app,
                fakeCalendarId
            )

            expect(statusCode).toEqual(400)
            await expect(body).toMatchError(
                calendarsErrors.getAvailableDays.calendarNotFound
            )
        })
    })

    describe('/available-spots (GET)', () => {
        it('Should get available spots on the selected date', async () => {
            const [registerRes] = await registerUser(app)
            const [publicCalendarId, calendarId] = await getCalendarId(
                prisma,
                registerRes.userEmail
            )
            const nextMonday = getNextMonday()

            await setAppointments(prisma, calendarId, nextMonday)
            const [body, statusCode] = await getAvailableSpots(
                app,
                publicCalendarId,
                nextMonday
            )

            expect(statusCode).toEqual(200)
            await expect(body).toMatchDto(GetAvailableSpotsRes)
        })

        it('Should throw when the calendar does not exist', async () => {
            const fakeCalendarId = faker.datatype.uuid()
            const futureDate = faker.date.soon()

            const [body, statusCode] = await getAvailableSpots(
                app,
                fakeCalendarId,
                futureDate
            )

            expect(statusCode).toEqual(400)
            await expect(body).toMatchError(
                calendarsErrors.getAvailableSpots.calendarNotFound
            )
        })
    })

    describe('/set-appointment (POST)', () => {
        it('Should get available spots on the selected date', async () => {
            const [registerRes] = await registerUser(app)
            const [publicCalendarId, calendarId] = await getCalendarId(
                prisma,
                registerRes.userEmail
            )
            const nextMonday = getNextMonday()
            await setAppointments(prisma, calendarId, nextMonday, 12)

            const [body, statusCode] = await setAppointment(
                app,
                publicCalendarId,
                dayjs(nextMonday).set('hour', 10).toDate()
            )

            expect(statusCode).toEqual(200)
            await expect(body).toMatchDto(SetAppointmentRes)
        })

        it('Should throw when the calendar does not exist', async () => {
            const fakeCalendarId = faker.datatype.uuid()
            const futureDate = faker.date.soon()

            const [body, statusCode] = await setAppointment(
                app,
                fakeCalendarId,
                futureDate
            )

            expect(statusCode).toEqual(400)
            await expect(body).toMatchError(
                calendarsErrors.setAppointment.calendarNotFound
            )
        })

        it('Should throw when the appointment is not on a working day', async () => {
            const [registerRes] = await registerUser(app)
            const [publicCalendarId] = await getCalendarId(
                prisma,
                registerRes.userEmail
            )
            const nextSaturday = getNextSaturday()

            const [body, statusCode] = await setAppointment(
                app,
                publicCalendarId,
                dayjs(nextSaturday).set('hour', 10).toDate()
            )

            expect(statusCode).toEqual(400)
            await expect(body).toMatchError(
                calendarsErrors.setAppointment.cannotBookOnNonWorkingDay
            )
        })

        it('Should throw when the appointment is not within the business hours', async () => {
            const [registerRes] = await registerUser(app)
            const [publicCalendarId] = await getCalendarId(
                prisma,
                registerRes.userEmail
            )
            const nextMonday = getNextMonday()

            const [body, statusCode] = await setAppointment(
                app,
                publicCalendarId,
                dayjs(nextMonday).set('hour', 3).toDate()
            )

            expect(statusCode).toEqual(400)
            await expect(body).toMatchError(
                calendarsErrors.setAppointment.cannotBookOutsideBusinessHours
            )
        })

        it('Should throw when the appointment is before the business hours', async () => {
            const [registerRes] = await registerUser(app)
            const [publicCalendarId] = await getCalendarId(
                prisma,
                registerRes.userEmail
            )
            const nextMonday = getNextMonday()

            const [body, statusCode] = await setAppointment(
                app,
                publicCalendarId,
                dayjs(nextMonday).set('hour', 2).toDate()
            )

            expect(statusCode).toEqual(400)
            await expect(body).toMatchError(
                calendarsErrors.setAppointment.cannotBookOutsideBusinessHours
            )
        })

        it('Should throw when the appointment is after the business hours', async () => {
            const [registerRes] = await registerUser(app)
            const [publicCalendarId] = await getCalendarId(
                prisma,
                registerRes.userEmail
            )
            const nextMonday = getNextMonday()

            const [body, statusCode] = await setAppointment(
                app,
                publicCalendarId,
                dayjs(nextMonday).set('hour', 20).toDate()
            )

            expect(statusCode).toEqual(400)
            await expect(body).toMatchError(
                calendarsErrors.setAppointment.cannotBookOutsideBusinessHours
            )
        })

        it('Should throw when the appointment is too close to the end of day', async () => {
            const [registerRes] = await registerUser(app)
            const [publicCalendarId] = await getCalendarId(
                prisma,
                registerRes.userEmail
            )
            const nextMonday = getNextMonday()

            const [body, statusCode] = await setAppointment(
                app,
                publicCalendarId,
                dayjs(nextMonday).set('hour', 16).set('minute', 45).toDate()
            )

            expect(statusCode).toEqual(400)
            await expect(body).toMatchError(
                calendarsErrors.setAppointment.tooLate
            )
        })

        it('Should throw when the appointment does not respect the previous appointments', async () => {
            const [registerRes] = await registerUser(app)
            const [publicCalendarId] = await getCalendarId(
                prisma,
                registerRes.userEmail
            )
            const nextMonday = getNextMonday()

            const [body, statusCode] = await setAppointment(
                app,
                publicCalendarId,
                dayjs(nextMonday).set('hour', 9).set('minute', 5).toDate()
            )

            expect(statusCode).toEqual(400)
            await expect(body).toMatchError(
                calendarsErrors.setAppointment.cannotBookAnyTime
            )
        })
    })

    describe('/calendars/appointments (GET)', () => {
        it('Should successfully get appointments in the selected month', async () => {
            const [registerRes] = await registerUser(app)
            const [, calendarId] = await getCalendarId(
                prisma,
                registerRes.userEmail
            )
            await setAppointments(prisma, calendarId, new Date())
            await setAppointments(
                prisma,
                calendarId,
                dayjs().add(1, 'day').toDate()
            )

            const [body, statusCode] = await getAppointments(
                app,
                registerRes.session
            )

            expect(statusCode).toEqual(200)
            await expect(body).toMatchDto(GetAppointmentsRes)
        })
    })

    describe('/calendars/appointment (GET)', () => {
        it('Should successfully get the info of an appointment', async () => {
            const [registerRes] = await registerUser(app)
            const [, calendarId] = await getCalendarId(
                prisma,
                registerRes.userEmail
            )
            const nextMonday = getNextMonday()
            await setAppointments(prisma, calendarId, nextMonday)
            const appointment = await prisma.appointments.findFirst({
                where: { calendarId },
                select: { id: true },
            })

            const [body, statusCode] = await getAppointmentInfo(
                app,
                registerRes.session,
                appointment.id
            )

            expect(statusCode).toEqual(200)
            await expect(body).toMatchDto(GetAppointmentInfoRes)
        })

        it('Should throw when the appointment does not exist', async () => {
            const [registerRes] = await registerUser(app)
            const fakeAppointmentId = faker.datatype.number()

            const [body, statusCode] = await getAppointmentInfo(
                app,
                registerRes.session,
                fakeAppointmentId
            )

            expect(statusCode).toEqual(400)
            await expect(body).toMatchError(
                calendarsErrors.getAppointmentInfo.appointmentNotFound
            )
        })
    })
})
