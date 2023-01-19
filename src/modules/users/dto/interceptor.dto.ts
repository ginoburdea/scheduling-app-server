import { IsString, Matches, MaxLength } from 'class-validator'

const bearerHeaderRegex = /^Bearer [a-z0-9]{64}$/i

export class AuthHeaders {
    @IsString()
    @Matches(bearerHeaderRegex)
    authorization: string
}
