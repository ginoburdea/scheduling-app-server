import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { buildApp } from '@/utils/buildApp'
import { UsersModule } from './users.module'
import { AuthRes } from './dto/common.dto'
import { genUserData, registerUser } from './users.testUtils'
import { usersErrors } from './users.errors'

describe('/users', () => {
    let app: NestFastifyApplication

    beforeAll(async () => {
        app = await buildApp(UsersModule)

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
})
