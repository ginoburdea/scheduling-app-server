import { faker } from '@faker-js/faker'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { AuthDto } from './dto/common.dto'

export const genUserData = (
    email = faker.internet.email(),
    password = faker.internet.password()
) => ({ email, password })

export const registerUser = async (
    app: NestFastifyApplication,
    userData: AuthDto = genUserData()
) => {
    const res = await app.inject({
        method: 'POST',
        url: '/users/register',
        payload: userData,
    })

    return [res.json(), res.statusCode, userData]
}

export const logInUser = async (
    app: NestFastifyApplication,
    userData: AuthDto
) => {
    const res = await app.inject({
        method: 'POST',
        url: '/users/log-in',
        payload: userData,
    })

    return [res.json(), res.statusCode, userData]
}
