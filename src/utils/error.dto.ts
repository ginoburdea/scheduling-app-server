import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsOptional, IsString } from 'class-validator'

export class ErrorDto {
    @ApiProperty({ example: 400 })
    @IsInt()
    statusCode: number

    @ApiProperty({ example: 'email is required' })
    @IsString()
    message: string

    @ApiProperty({ required: false, example: 'Bad request' })
    @IsOptional()
    @IsString()
    error: string
}
