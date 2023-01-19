import { ErrorDto } from '@/utils/ErrorRes'
import { Body, Controller, HttpCode, Ip, Post } from '@nestjs/common'
import { ApiOkResponse, ApiTags, ApiDefaultResponse } from '@nestjs/swagger'
import { AuthRes } from './dto/common.dto'
import { RegisterDto } from './dto/register.dto'
import { UsersService } from './users.service'

@Controller('users')
@ApiTags('users')
@ApiDefaultResponse({ type: ErrorDto })
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post('register')
    @HttpCode(200)
    @ApiOkResponse({ type: AuthRes })
    async register(@Body() body: RegisterDto, @Ip() ip: string) {
        return await this.usersService.register(body.email, body.password, ip)
    }
}
