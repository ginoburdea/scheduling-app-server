import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsDate, IsDateString, IsString, IsUUID } from 'class-validator'
import { capitalCase } from 'change-case'

export class SetAppointmentDto {
    @ApiProperty({ format: 'uuid' })
    @IsUUID()
    calendarId: string

    @ApiProperty()
    @IsDate()
    date: Date

    @ApiProperty({ example: 'John Doe' })
    @IsString()
    @Transform(text => capitalCase(text.value))
    name: string

    @ApiProperty({ example: '+4 0700 000 000' })
    @IsString()
    phoneNumber: string
}

export class SetAppointmentRes {
    @ApiProperty({ type: 'string', format: 'date-time' })
    @IsDateString()
    date: string

    @ApiProperty({ example: '+4 0700 000 000' })
    @IsString()
    phoneNumber: string

    @ApiProperty({ example: 'John Doe' })
    @IsString()
    name: string
}
