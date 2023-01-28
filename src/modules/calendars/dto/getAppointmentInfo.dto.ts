import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsString } from 'class-validator'

export class GetAppointmentInfoDto {
    @ApiProperty({ example: 175 })
    @IsInt()
    appointmentId: number
}

export class GetAppointmentInfoRes {
    @ApiProperty({ example: 'John Doe' })
    @IsString()
    clientName: string

    @ApiProperty({ example: '+4 0700 000 000' })
    @IsString()
    clientPhoneNumber: string
}
