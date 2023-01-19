import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { CalendarsModule } from './modules/calendars/calendars.module'
import { UsersModule } from './modules/users/users.module'

@Module({
    imports: [ConfigModule.forRoot(), UsersModule, CalendarsModule],
})
export class AppModule {}
