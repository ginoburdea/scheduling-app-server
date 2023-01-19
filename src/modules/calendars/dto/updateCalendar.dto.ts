import { ApiProperty, PartialType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
    ArrayMaxSize,
    ArrayUnique,
    IsArray,
    IsInt,
    IsMilitaryTime,
    IsString,
    IsUUID,
    Max,
    MaxLength,
    Min,
    MinLength,
    ValidateNested,
} from 'class-validator'

class Calendar {
    @ApiProperty()
    @IsString()
    @MinLength(4)
    @MaxLength(32)
    businessName: string

    @ApiProperty()
    @IsString()
    @MinLength(8)
    @MaxLength(128)
    businessDescription: string

    @ApiProperty()
    @IsMilitaryTime()
    dayStartsAt: string

    @ApiProperty()
    @IsMilitaryTime()
    dayEndsAt: string

    @ApiProperty()
    @IsInt()
    @Min(0)
    breakBetweenBookings: number

    @ApiProperty()
    @IsInt()
    @Min(5)
    bookingDuration: number

    @ApiProperty()
    @IsInt()
    @Min(0)
    bookInAdvance: number

    @IsArray()
    @ArrayUnique()
    @ArrayMaxSize(7)
    @IsInt({ each: true })
    @Min(0, { each: true })
    @Max(6, { each: true })
    @ApiProperty({ type: 'array', items: { type: 'number' } })
    workingDays: number[]
}

export class PartialCalendar extends PartialType(Calendar) {}

export class UpdateCalendarDto {
    @ApiProperty()
    @IsUUID()
    id: string

    @ApiProperty()
    @ValidateNested()
    @Type(() => PartialCalendar)
    updates: PartialCalendar
}

export class UpdateCalendarRes extends Calendar {}
