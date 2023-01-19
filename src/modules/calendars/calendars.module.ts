import { PrismaService } from '@/utils/prisma.service'
import { Module } from '@nestjs/common'
import { UsersModule } from '../users/users.module'
import { CalendarsController } from './calendars.controller'
import { CalendarsService } from './calendars.service'

@Module({
    imports: [UsersModule],
    controllers: [CalendarsController],
    providers: [CalendarsService, PrismaService],
})
export class CalendarsModule {}
