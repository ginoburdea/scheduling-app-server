import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsString, IsUUID } from 'class-validator'

export class GetAppointmentInfoDto {
    @ApiProperty()
    @IsInt()
    appointmentId: number
}

export class GetAppointmentInfoRes {
    @ApiProperty()
    @IsString()
    clientName: string

    @ApiProperty()
    @IsString()
    clientPhoneNumber: string
}
