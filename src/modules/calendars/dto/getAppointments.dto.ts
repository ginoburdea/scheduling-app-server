import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
    IsArray,
    IsDateString,
    IsInt,
    IsString,
    Max,
    Min,
    ValidateNested,
} from 'class-validator'

export class GetAppointmentsDto {
    @ApiProperty({
        example: new Date().getMonth() + 1,
        minimum: 1,
        maximum: 12,
    })
    @IsInt()
    @Min(1)
    @Max(12)
    month: number

    @ApiProperty({ example: new Date().getFullYear() })
    @IsInt()
    year: number
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
