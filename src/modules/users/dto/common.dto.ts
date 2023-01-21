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

export class AuthRes {
    @ApiProperty()
    @IsUUID()
    calendarId: string

    @ApiProperty()
    @IsEmail()
    userEmail: string

    @ApiProperty()
    @IsString()
    @Length(64)
    session: string

    @ApiProperty()
    @IsDateString()
    sessionExpiresAt: Date
}
