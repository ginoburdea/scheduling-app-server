import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator'

export class RegisterDto {
    @ApiProperty()
    @IsEmail()
    @Transform(({ value }) => value.toLowerCase())
    email: string

    @ApiProperty()
    @IsString()
    @MinLength(8)
    @MaxLength(64)
    password: string
}
