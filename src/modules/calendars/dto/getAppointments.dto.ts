import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
    IsArray,
    IsDateString,
    IsInt,
    IsString,
    IsUUID,
    Max,
    Min,
    Validate,
    ValidateNested,
} from 'class-validator'

export class GetAppointmentsDto {
    @ApiProperty()
    @IsInt()
    @Min(1)
    @Max(12)
    month: number

    @ApiProperty()
    @IsInt()
    year: number
}

class MiniAppointment {
    @ApiProperty()
    @IsDateString()
    startsAt: Date

    @ApiProperty()
    @IsDateString()
    endsAt: Date
}

class Appointment {
    @ApiProperty()
    @IsString()
    day: string

    @ApiProperty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MiniAppointment)
    appointments: MiniAppointment[]
}

export class GetAppointmentsRes {
    @ApiProperty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Appointment)
    appointments: Appointment[]
}
