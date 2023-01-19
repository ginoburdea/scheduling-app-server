import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { UsersModule } from './modules/users/users.module'

@Module({
    imports: [ConfigModule.forRoot(), UsersModule],
})
export class AppModule {}
