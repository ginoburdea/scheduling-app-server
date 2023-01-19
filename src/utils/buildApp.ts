import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { FastifyAdapter } from '@nestjs/platform-fastify/adapters'
import { NestFastifyApplication } from '@nestjs/platform-fastify/interfaces'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { getVersion } from './getVersion'
import { validationOptions } from './validationOptions'

export const buildApp = async (Module: any) => {
    const app = await NestFactory.create<NestFastifyApplication>(
        Module,
        new FastifyAdapter()
    )
    app.useGlobalPipes(new ValidationPipe(validationOptions))

    const config = new DocumentBuilder()
        .setTitle('scheduling-app-server docs')
        .setDescription(
            'The OpenAPI documentation of the scheduling-app-server'
        )
        .setVersion(getVersion())
        .addBearerAuth()
        .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('docs', app, document)

    return app
}
