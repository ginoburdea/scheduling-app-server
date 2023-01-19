import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsUUID } from 'class-validator'

export class GetCalendarInfoDto {
    @ApiProperty()
    @IsUUID()
    id: string
}

export class GetCalendarInfoRes {
    @ApiProperty()
    @IsString()
    businessName: string

    @ApiProperty()
    @IsString()
    businessDescription: string
}
