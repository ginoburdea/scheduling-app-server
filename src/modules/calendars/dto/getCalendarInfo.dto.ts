import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsUUID } from 'class-validator'

export class GetCalendarInfoDto {
    @ApiProperty({ format: 'uuid' })
    @IsUUID()
    id: string
}

export class GetCalendarInfoRes {
    @ApiProperty({ example: 'Lorem Ipsum Inc.' })
    @IsString()
    businessName: string

    @ApiProperty({
        example: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
    })
    @IsString()
    businessDescription: string
}
