import {
    CallHandler,
    Injectable,
    NestInterceptor,
    UnauthorizedException,
} from '@nestjs/common'
import { UsersService } from './users.service'
import { FastifyRequest } from 'fastify'
import { plainToInstance } from 'class-transformer'
import { AuthHeaders } from './dto/interceptor.dto'
import { validateOrReject } from 'class-validator'
import { validationOptions } from '@/utils/validationOptions'
import { ExecutionContext } from '@nestjs/common/interfaces/features/execution-context.interface'

@Injectable()
export class AuthInterceptor implements NestInterceptor {
    constructor(private usersService: UsersService) {}

    async intercept(context: ExecutionContext, next: CallHandler) {
        const req = context.switchToHttp().getRequest() as FastifyRequest
        const headers = plainToInstance(AuthHeaders, req.headers)
        await validateOrReject(headers, validationOptions).catch(() => {
            throw new UnauthorizedException()
        })

        const publicSessionId = headers.authorization.split(' ')[1]
        const { user, sessionId } = await this.usersService.isLoggedIn(
            publicSessionId,
            req.ip
        )
        req.user = user
        req.sessionId = sessionId

        return next.handle()
    }
}
