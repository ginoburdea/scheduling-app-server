import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
    IsArray,
    IsDate,
    IsDateString,
    IsInt,
    IsString,
    ValidateNested,
} from 'class-validator'

export class GetAppointmentsDto {
    @ApiProperty()
    @IsDate()
    atOrAfter: Date

    @ApiProperty()
    @IsDate()
    atOrBefore: Date
}

class MiniAppointment {
    @ApiProperty({ example: 175 })
    @IsInt()
    id: number

    @ApiProperty({ type: 'string', format: 'date-time' })
    @IsDateString()
    startsAt: string

    @ApiProperty({ type: 'string', format: 'date-time' })
    @IsDateString()
    endsAt: string
}

class Appointment {
    @ApiProperty({ format: 'date-time' })
    @IsString()
    day: string

    @ApiProperty({ type: [MiniAppointment] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MiniAppointment)
    appointments: MiniAppointment[]
}

export class GetAppointmentsRes {
    @ApiProperty({ type: [Appointment] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Appointment)
    appointments: Appointment[]
}
