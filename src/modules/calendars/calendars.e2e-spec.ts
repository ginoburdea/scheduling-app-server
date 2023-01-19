import { PrismaService } from '@/utils/prisma.service'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { expect, describe, it, beforeAll } from '@jest/globals'
import { buildApp } from '@/utils/buildApp'
import { CalendarsModule } from './calendars.module'
import { registerUser } from '../users/users.testUtils'
import { UpdateCalendarRes } from './dto/updateCalendar.dto'
import {
    getCalendarId,
    getCalendarInfo,
    updateCalendar,
} from './calendars.testUtils'
import { faker } from '@faker-js/faker'
import { calendarsErrors } from './calendars.errors'
import { GetCalendarInfoRes } from './dto/getCalendarInfo.dto'

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
            const calendarId = await getCalendarId(
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
            const calendarId = await getCalendarId(
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
            const calendarId = await getCalendarId(
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
})
