import { expect } from '@jest/globals'
import type { MatcherFunction } from 'expect'
import { plainToInstance, ClassConstructor } from 'class-transformer'
import { IsInt, IsOptional, IsString, validate } from 'class-validator'
import { validationOptions } from './validationOptions'
import { ErrorDto } from './ErrorRes'

const toMatchDto: MatcherFunction<[dto: ClassConstructor<any>]> =
    async function (actual, dto) {
        const instance = plainToInstance(dto, actual)
        const errors = await validate(instance, validationOptions)

        const pass = errors.length === 0
        return {
            message: () =>
                `expected ${this.utils.printReceived(actual)}${
                    pass ? ' not' : ''
                } to match ${dto.name}`,
            pass,
        }
    }

expect.extend({ toMatchDto })

const toMatchError: MatcherFunction<[error: string]> = async function (
    actual: ErrorDto,
    error
) {
    await (expect as unknown as jest.Expect)(actual).toMatchDto(ErrorDto)

    const pass = actual.message === error
    return {
        message: () =>
            `expected ${this.utils.printReceived(actual)}${
                pass ? ' not' : ''
            } to match error ${error}`,
        pass,
    }
}

expect.extend({ toMatchError })
