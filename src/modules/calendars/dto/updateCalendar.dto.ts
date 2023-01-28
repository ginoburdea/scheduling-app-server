import { ApiProperty, PartialType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsUUID, ValidateNested } from 'class-validator'
import { Calendar } from './common.dto'

export class PartialCalendar extends PartialType(Calendar) {}

export class UpdateCalendarDto {
    @ApiProperty({ format: 'uuid' })
    @IsUUID()
    id: string

    @ApiProperty()
    @ValidateNested()
    @Type(() => PartialCalendar)
    updates: PartialCalendar
}

export class UpdateCalendarRes extends Calendar {}
