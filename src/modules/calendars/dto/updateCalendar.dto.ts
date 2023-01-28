import { PartialType } from '@nestjs/swagger'
import { Calendar } from './common.dto'

export class PartialCalendar extends PartialType(Calendar) {}

export class UpdateCalendarDto extends PartialCalendar {}

export class UpdateCalendarRes extends Calendar {}
