import { faker } from '@faker-js/faker'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { AuthDto, AuthRes } from './dto/common.dto'

export const genUserData = ({
    email = faker.internet.email(),
    password = faker.internet.password(),
} = {}) => ({ email, password })

export const registerUser = async (
    app: NestFastifyApplication,
    userData: AuthDto = genUserData()
): Promise<[AuthRes, number, AuthDto]> => {
    const res = await app.inject({
        method: 'POST',
        url: '/users/register',
        payload: userData,
    })

    return [res.json() as AuthRes, res.statusCode, userData]
}

export const logInUser = async (
    app: NestFastifyApplication,
    userData: AuthDto
): Promise<[AuthRes, number, AuthDto]> => {
    const res = await app.inject({
        method: 'POST',
        url: '/users/log-in',
        payload: userData,
    })

    return [res.json() as AuthRes, res.statusCode, userData]
}

export const logOutUser = async (
    app: NestFastifyApplication,
    sessionId: string
): Promise<[string, number]> => {
    const res = await app.inject({
        method: 'POST',
        url: '/users/log-out',
        headers: {
            authorization: `Bearer ${sessionId}`,
        },
    })

    try {
        return [res.json(), res.statusCode]
    } catch (err) {
        return [res.body, res.statusCode]
    }
}
