import { BadRequestException, ValidationPipeOptions } from '@nestjs/common'

export const validationOptions: ValidationPipeOptions = {
    skipUndefinedProperties: false,
    skipNullProperties: false,
    skipMissingProperties: false,
    whitelist: true,
    forbidNonWhitelisted: false,
    forbidUnknownValues: true,
    stopAtFirstError: true,
    transform: true,
    transformOptions: {
        enableImplicitConversion: true,
    },
    exceptionFactory: errors => {
        const constraint = Object.keys(errors[0].constraints)[0]
        return new BadRequestException(errors[0].constraints[constraint])
    },
}
