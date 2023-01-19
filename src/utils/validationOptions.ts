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
        const [error] = errors

        if (error.constraints) {
            const constraint = Object.keys(error.constraints)[0]
            return new BadRequestException(errors[0].constraints[constraint])
        } else {
            const constraint = Object.keys(error.children[0].constraints)[0]
            return new BadRequestException(
                errors[0].children[0].constraints[constraint]
            )
        }
    },
}
