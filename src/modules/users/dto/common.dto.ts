import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import {
    IsDateString,
    IsEmail,
    IsString,
    IsUUID,
    Length,
    MaxLength,
    MinLength,
} from 'class-validator'

export class AuthDto {
    @ApiProperty({ format: 'email' })
    @IsEmail()
    @Transform(({ value }) => value.toLowerCase())
    email: string

    @ApiProperty({ example: 'U5@!d3r78%m%zb*c' })
    @IsString()
    @MinLength(8)
    @MaxLength(64)
    password: string
}

export class AuthRes {
    @ApiProperty({ format: 'uuid' })
    @IsUUID()
    calendarId: string

    @ApiProperty({ format: 'email' })
    @IsEmail()
    userEmail: string

    @ApiProperty({
        example:
            'mu5bKH*@dfC2^!N22LjG8Lf@QoCye^D8om%gMVn!D@n5paLeZq#^xW6XS%6gqTJ9',
    })
    @IsString()
    @Length(64)
    session: string

    @ApiProperty({ format: 'date-time' })
    @IsDateString()
    sessionExpiresAt: string
}
