import { PrismaService } from '@/utils/prisma.service'
import { BadRequestException, Injectable } from '@nestjs/common'
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
}
