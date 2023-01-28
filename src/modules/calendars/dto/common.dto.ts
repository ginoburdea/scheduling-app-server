import { ApiProperty } from '@nestjs/swagger'
import {
    ArrayMaxSize,
    ArrayUnique,
    IsArray,
    IsInt,
    IsMilitaryTime,
    IsString,
    Max,
    MaxLength,
    Min,
    MinLength,
} from 'class-validator'

export class Calendar {
    @ApiProperty({ example: 'Lorem Ipsum Inc.' })
    @IsString()
    @MinLength(4)
    @MaxLength(32)
    businessName: string

    @ApiProperty({
        example: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
    })
    @IsString()
    @MinLength(8)
    @MaxLength(128)
    businessDescription: string

    @ApiProperty({ example: '09:00' })
    @IsMilitaryTime()
    dayStartsAt: string

    @ApiProperty({ example: '17:00' })
    @IsMilitaryTime()
    dayEndsAt: string

    @ApiProperty({ example: 5 })
    @IsInt()
    @Min(0)
    breakBetweenBookings: number

    @ApiProperty({ example: 25 })
    @IsInt()
    @Min(5)
    bookingDuration: number

    @ApiProperty({ example: 14 })
    @IsInt()
    @Min(0)
    bookInAdvance: number

    @IsArray()
    @ArrayUnique()
    @ArrayMaxSize(7)
    @IsInt({ each: true })
    @Min(0, { each: true })
    @Max(6, { each: true })
    @ApiProperty({ type: ['number'], example: [0, 1, 2, 3, 4] })
    workingDays: number[]
}
