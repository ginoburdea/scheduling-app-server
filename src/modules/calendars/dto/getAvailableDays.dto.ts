import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsDateString, IsUUID } from 'class-validator'

export class GetAvailableDaysDto {
    @ApiProperty({ format: 'uuid' })
    @IsUUID()
    calendarId: string
}

export class GetAvailableDaysRes {
    @ApiProperty({
        type: 'array',
        items: { type: 'string', format: 'date-time' },
    })
    @IsArray()
    @IsDateString({}, { each: true })
    dates: string[]
}
