import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { buildApp } from '@/utils/buildApp'
import { UsersModule } from './users.module'
import { AuthRes } from './dto/common.dto'
import {
    genUserData,
    logInUser,
    logOutUser,
    registerUser,
} from './users.testUtils'
import { usersErrors } from './users.errors'
import { faker } from '@faker-js/faker'
import { expect, describe, it, beforeAll } from '@jest/globals'
import { ErrorDto } from '@/utils/error.dto'
import * as randomString from 'randomstring'
import * as dayjs from 'dayjs'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '@/utils/prisma.service'

describe('/users', () => {
    let app: NestFastifyApplication
    let prisma: PrismaService

    beforeAll(async () => {
        app = await buildApp(UsersModule)
        prisma = app.get<PrismaService>(PrismaService)

        await app.init()
        await app.getHttpAdapter().getInstance().ready()
    })

    describe('/register (POST)', () => {
        it('Should register a user successfully', async () => {
            const [body, statusCode] = await registerUser(app)

            expect(statusCode).toEqual(200)
            await expect(body).toMatchDto(AuthRes)
        })

        it('Should throw when the email is in use', async () => {
            const userData = genUserData()
            await registerUser(app, userData)

            const [body, statusCode] = await registerUser(app, userData)

            expect(statusCode).toEqual(400)
            await expect(body).toMatchError(usersErrors.register.emailInUse)
        })
    })

    describe('/log-in (POST)', () => {
        it('Should log in a user successfully', async () => {
            const userData = genUserData()
            await registerUser(app, userData)

            const [body, statusCode] = await logInUser(app, userData)

            expect(statusCode).toEqual(200)
            await expect(body).toMatchDto(AuthRes)
        })

        it('Should throw when the email is not in use', async () => {
            await registerUser(app)

            const [body, statusCode] = await logInUser(app, genUserData())

            expect(statusCode).toEqual(400)
            await expect(body).toMatchError(usersErrors.logIn.userNotFound)
        })

        it('Should throw when the password is incorrect', async () => {
            const userData = genUserData()
            await registerUser(app, userData)

            const [body, statusCode] = await logInUser(app, {
                email: userData.email,
                password: faker.internet.password(),
            })

            expect(statusCode).toEqual(400)
            await expect(body).toMatchError(usersErrors.logIn.wrongPassword)
        })
    })

    describe('/log-out (POST)', () => {
        it('Should log out a user successfully', async () => {
            const [registerRes] = await registerUser(app)

            const [body, statusCode] = await logOutUser(
                app,
                registerRes.session
            )

            expect(statusCode).toEqual(201)
            expect(body).toEqual('')
        })
    })

    describe('Auth Interceptor', () => {
        it('Should throw when the session id is invalid', async () => {
            const [body, statusCode] = await logOutUser(app, '')

            expect(statusCode).toEqual(401)
            await expect(body).toMatchDto(ErrorDto)
        })

        it('Should throw when the session does not exist', async () => {
            const fakeSessionId = randomString.generate(64)

            const [body, statusCode] = await logOutUser(app, fakeSessionId)

            expect(statusCode).toEqual(401)
            await expect(body).toMatchError(
                usersErrors.isLoggedIn.sessionNotFound
            )
        })

        it('Should throw when the session is expired', async () => {
            const [registerRes] = await registerUser(app)

            const pastDate = dayjs().subtract(1, 'day').toDate()
            await prisma.sessions.updateMany({
                where: { publicId: registerRes.session },
                data: { expiresAt: pastDate },
            })

            const [body, statusCode] = await logOutUser(
                app,
                registerRes.session
            )

            expect(statusCode).toEqual(401)
            await expect(body).toMatchError(
                usersErrors.isLoggedIn.sessionExpired
            )
        })

        it('Should throw when the session is hijacked', async () => {
            const [registerRes] = await registerUser(app)

            const fakeIp = await bcrypt.hash(faker.internet.ip(), 12)
            await prisma.sessions.updateMany({
                where: { publicId: registerRes.session },
                data: { userIp: fakeIp },
            })

            const [body, statusCode] = await logOutUser(
                app,
                registerRes.session
            )

            expect(statusCode).toEqual(401)
            await expect(body).toMatchError(
                usersErrors.isLoggedIn.sessionHijacked
            )
        })
    })
})
