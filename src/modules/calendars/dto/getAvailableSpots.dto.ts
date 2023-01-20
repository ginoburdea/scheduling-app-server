import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsDate, IsDateString, IsUUID } from 'class-validator'

export class GetAvailableSpotsDto {
    @ApiProperty()
    @IsDate()
    date: Date

    @ApiProperty()
    @IsUUID()
    calendarId: string
}

export class GetAvailableSpotsRes {
    @ApiProperty()
    @IsArray()
    @IsDateString({}, { each: true })
    spots: Date[]
}
