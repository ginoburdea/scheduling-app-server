import { ErrorDto } from '@/utils/error.dto'
import {
    Body,
    Controller,
    Req,
    UseInterceptors,
    Put,
    Get,
    Query,
    Post,
    HttpCode,
} from '@nestjs/common'
import { ApiOkResponse, ApiTags, ApiDefaultResponse } from '@nestjs/swagger'
import { CalendarsService } from './calendars.service'
import { UpdateCalendarDto, UpdateCalendarRes } from './dto/updateCalendar.dto'
import { AuthInterceptor } from '../users/auth.interceptor'
import { FastifyRequest } from 'fastify'
import {
    GetCalendarInfoDto,
    GetCalendarInfoRes,
} from './dto/getCalendarInfo.dto'
import {
    GetAvailableDaysDto,
    GetAvailableDaysRes,
} from './dto/getAvailableDays.dto'
import {
    GetAvailableSpotsDto,
    GetAvailableSpotsRes,
} from './dto/getAvailableSpots.dto'
import { SetAppointmentDto, SetAppointmentRes } from './dto/setAppointment.dto'
import {
    GetAppointmentsDto,
    GetAppointmentsRes,
} from './dto/getAppointments.dto'
import {
    GetAppointmentInfoDto,
    GetAppointmentInfoRes,
} from './dto/getAppointmentInfo.dto'
import { GetCalendarSettingsRes } from './dto/getCalendarSettings.dto'

@Controller('calendars')
@ApiTags('calendars')
@ApiDefaultResponse({ type: ErrorDto })
export class CalendarsController {
    constructor(private readonly calendarsService: CalendarsService) {}

    @Get('settings')
    @UseInterceptors(AuthInterceptor)
    @ApiOkResponse({ type: GetCalendarSettingsRes })
    async getCalendarSettings(@Req() req: FastifyRequest) {
        return await this.calendarsService.getCalendarSettings(req.calendarId)
    }

    @Put()
    @UseInterceptors(AuthInterceptor)
    @ApiOkResponse({ type: UpdateCalendarRes })
    async updateCalendar(
        @Body() body: UpdateCalendarDto,
        @Req() req: FastifyRequest
    ) {
        return await this.calendarsService.updateCalendar(
            body.id,
            body.updates,
            req.user.id
        )
    }

    @Get()
    @ApiOkResponse({ type: GetCalendarInfoRes })
    async getCalendarInfo(@Query() query: GetCalendarInfoDto) {
        return await this.calendarsService.getCalendarInfo(query.id)
    }

    @Get('available-days')
    @ApiOkResponse({ type: GetAvailableDaysRes })
    async getAvailableDays(@Query() query: GetAvailableDaysDto) {
        return await this.calendarsService.getAvailableDays(query.calendarId)
    }

    @Get('available-spots')
    @ApiOkResponse({ type: GetAvailableSpotsRes })
    async getAvailableSpots(@Query() query: GetAvailableSpotsDto) {
        return await this.calendarsService.getAvailableSpots(
            query.calendarId,
            query.date
        )
    }

    @Post('set-appointment')
    @HttpCode(200)
    @ApiOkResponse({ type: SetAppointmentRes })
    async setAppointment(@Body() body: SetAppointmentDto) {
        return await this.calendarsService.setAppointment(
            body.calendarId,
            body.date,
            body.name,
            body.phoneNumber
        )
    }

    @Get('appointments')
    @UseInterceptors(AuthInterceptor)
    @ApiOkResponse({ type: GetAppointmentsRes })
    async getAppointments(
        @Query() query: GetAppointmentsDto,
        @Req() req: FastifyRequest
    ) {
        return await this.calendarsService.getAppointments(
            req.calendarId,
            query.month,
            query.year
        )
    }

    @Get('appointment')
    @UseInterceptors(AuthInterceptor)
    @ApiOkResponse({ type: GetAppointmentInfoRes })
    async getAppointmentInfo(
        @Query() query: GetAppointmentInfoDto,
        @Req() req: FastifyRequest
    ) {
        return await this.calendarsService.getAppointmentInfo(
            req.calendarId,
            query.appointmentId
        )
    }
}
