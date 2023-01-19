import { PrismaService } from '@/utils/prisma.service'
import { Module } from '@nestjs/common'
import { AuthInterceptor } from './auth.interceptor'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

@Module({
    controllers: [UsersController],
    providers: [UsersService, PrismaService, AuthInterceptor],
    exports: [UsersService],
})
export class UsersModule {}
