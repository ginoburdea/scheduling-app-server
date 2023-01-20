import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsDateString, IsUUID } from 'class-validator'

export class GetAvailableDaysDto {
    @ApiProperty()
    @IsUUID()
    calendarId: string
}

export class GetAvailableDaysRes {
    @ApiProperty()
    @IsArray()
    @IsDateString({}, { each: true })
    dates: string
}
