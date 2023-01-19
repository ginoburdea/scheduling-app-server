import { ApiProperty } from '@nestjs/swagger'
import { IsDateString, IsEmail, IsString, Length } from 'class-validator'

export class AuthRes {
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
