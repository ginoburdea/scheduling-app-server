import { PrismaService } from '@/utils/prisma.service'
import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common'
import { usersErrors } from './users.errors'
import * as bcrypt from 'bcrypt'
import * as dayjs from 'dayjs'
import * as randomString from 'randomstring'

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    private async createSession(userId: number, userIp: string) {
        const session = await this.prisma.sessions.create({
            data: {
                publicId: randomString.generate(64),
                userId,
                userIp: await bcrypt.hash(userIp, 12),
                expiresAt: dayjs().add(7, 'days').toDate(),
            },
        })

        return {
            session: session.publicId,
            sessionExpiresAt: session.expiresAt,
        }
    }

    async isLoggedIn(publicSessionId: string, userIp: string) {
        const session = await this.prisma.sessions.findFirst({
            where: { publicId: publicSessionId },
            select: {
                userIp: true,
                expiresAt: true,
                id: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
            },
        })
        if (!session) {
            throw new UnauthorizedException(
                usersErrors.isLoggedIn.sessionNotFound
            )
        }

        try {
            if (session.expiresAt < new Date()) {
                throw new UnauthorizedException(
                    usersErrors.isLoggedIn.sessionExpired
                )
            }

            const ipsMatch = await bcrypt.compare(userIp, session.userIp)
            if (!ipsMatch) {
                throw new UnauthorizedException(
                    usersErrors.isLoggedIn.sessionHijacked
                )
            }
        } catch (err) {
            await this.prisma.sessions.delete({
                where: { id: session.id },
            })

            throw new UnauthorizedException(err.message)
        }

        return {
            sessionId: session.id,
            user: session.user,
        }
    }

    async register(email: string, password: string, ip: string) {
        const existingUser = await this.prisma.users.findFirst({
            where: { email },
            select: { email: true },
        })
        if (existingUser) {
            throw new BadRequestException(usersErrors.register.emailInUse)
        }

        const hashedPassword = await bcrypt.hash(password, 12)
        const user = await this.prisma.users.create({
            data: { email, password: hashedPassword },
        })

        const { session, sessionExpiresAt } = await this.createSession(
            user.id,
            ip
        )
        return {
            userEmail: user.email,
            session,
            sessionExpiresAt,
        }
    }

    async logIn(email: string, password: string, ip: string) {
        const user = await this.prisma.users.findFirst({
            where: { email },
            select: { id: true, email: true, password: true },
        })
        if (!user) {
            throw new BadRequestException(usersErrors.logIn.userNotFound)
        }

        const passwordsMatch = await bcrypt.compare(password, user.password)
        if (!passwordsMatch) {
            throw new BadRequestException(usersErrors.logIn.wrongPassword)
        }

        const { session, sessionExpiresAt } = await this.createSession(
            user.id,
            ip
        )
        return {
            userEmail: user.email,
            session,
            sessionExpiresAt,
        }
    }

    async logOut(sessionId: number) {
        await this.prisma.sessions.delete({ where: { id: sessionId } })
    }
}
