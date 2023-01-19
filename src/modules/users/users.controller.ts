import { ErrorDto } from '@/utils/error.dto'
import {
    Body,
    Controller,
    HttpCode,
    Ip,
    Post,
    Req,
    UseInterceptors,
} from '@nestjs/common'
import { ApiOkResponse, ApiTags, ApiDefaultResponse } from '@nestjs/swagger'
import { AuthDto, AuthRes } from './dto/common.dto'
import { UsersService } from './users.service'
import { FastifyRequest } from 'fastify'
import { AuthInterceptor } from './auth.interceptor'

@Controller('users')
@ApiTags('users')
@ApiDefaultResponse({ type: ErrorDto })
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post('register')
    @HttpCode(200)
    @ApiOkResponse({ type: AuthRes })
    async register(@Body() body: AuthDto, @Ip() ip: string) {
        return await this.usersService.register(body.email, body.password, ip)
    }

    @Post('log-in')
    @HttpCode(200)
    @ApiOkResponse({ type: AuthRes })
    async logIn(@Body() body: AuthDto, @Ip() ip: string) {
        return await this.usersService.logIn(body.email, body.password, ip)
    }

    @Post('log-out')
    @HttpCode(201)
    @UseInterceptors(AuthInterceptor)
    // @ApiOkResponse({ type: AuthRes })
    async logOut(@Req() req: FastifyRequest) {
        return await this.usersService.logOut(req.sessionId)
    }
}
