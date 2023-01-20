import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsDate, IsDateString, IsString, IsUUID } from 'class-validator'
import { capitalCase } from 'change-case'

export class SetAppointmentDto {
    @ApiProperty()
    @IsUUID()
    calendarId: string

    @ApiProperty()
    @IsDate()
    date: Date

    @ApiProperty()
    @IsString()
    @Transform(text => capitalCase(text.value))
    name: string

    @ApiProperty()
    @IsString()
    phoneNumber: string
}

export class SetAppointmentRes {
    @ApiProperty()
    @IsDateString()
    date: Date

    @ApiProperty()
    @IsString()
    phoneNumber: string

    @ApiProperty()
    @IsString()
    name: string
}
