import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsOptional, IsString } from 'class-validator'

export class ErrorDto {
    @ApiProperty()
    @IsInt()
    statusCode: number

    @ApiProperty()
    @IsString()
    message: string

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    error: string
}
