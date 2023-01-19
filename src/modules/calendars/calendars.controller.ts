import { ErrorDto } from '@/utils/error.dto'
import { Body, Controller, Req, UseInterceptors, Put } from '@nestjs/common'
import { ApiOkResponse, ApiTags, ApiDefaultResponse } from '@nestjs/swagger'
import { CalendarsService } from './calendars.service'
import { UpdateCalendarDto, UpdateCalendarRes } from './dto/getCalendar.dto'
import { AuthInterceptor } from '../users/auth.interceptor'
import { FastifyRequest } from 'fastify'

@Controller('calendars')
@ApiTags('calendars')
@ApiDefaultResponse({ type: ErrorDto })
export class CalendarsController {
    constructor(private readonly calendarsService: CalendarsService) {}

    @Put()
    @UseInterceptors(AuthInterceptor)
    @ApiOkResponse({ type: UpdateCalendarRes })
    async register(
        @Body() body: UpdateCalendarDto,
        @Req() req: FastifyRequest
    ) {
        return await this.calendarsService.updateCalendar(
            body.id,
            body.updates,
            req.user.id
        )
    }
}
