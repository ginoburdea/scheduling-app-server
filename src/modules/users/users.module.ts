import { PrismaService } from '@/utils/prisma.service'
import { Module } from '@nestjs/common'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

@Module({
    imports: [],
    controllers: [UsersController],
    providers: [UsersService, PrismaService],
})
export class UsersModule {}
