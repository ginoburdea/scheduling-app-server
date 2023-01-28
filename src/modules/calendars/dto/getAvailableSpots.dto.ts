import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsDate, IsDateString, IsUUID } from 'class-validator'

export class GetAvailableSpotsDto {
    @ApiProperty({ format: 'date-time' })
    @IsDate()
    date: Date

    @ApiProperty({ format: 'uuid' })
    @IsUUID()
    calendarId: string
}

export class GetAvailableSpotsRes {
    @ApiProperty({
        type: 'array',
        items: { type: 'string', format: 'date-time' },
    })
    @IsArray()
    @IsDateString({}, { each: true })
    spots: string[]
}
