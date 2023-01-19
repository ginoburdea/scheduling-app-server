import { faker } from '@faker-js/faker'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { RegisterDto } from './dto/register.dto'

export const genUserData = (
    email = faker.internet.email(),
    password = faker.internet.password()
) => ({ email, password })

export const registerUser = async (
    app: NestFastifyApplication,
    userData: RegisterDto = genUserData()
) => {
    const res = await app.inject({
        method: 'POST',
        url: '/users/register',
        payload: userData,
    })

    return [res.json(), res.statusCode, userData]
}
