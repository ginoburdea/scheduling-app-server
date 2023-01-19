interface CustomMatchers<R = unknown> {
    toMatchDto(dto: ClassConstructor<any>): Promise<R>
    toMatchError(error: string): Promise<R>
}

declare global {
    namespace jest {
        type Expect = CustomMatchers
        type Matchers<R> = CustomMatchers<R>
        type InverseAsymmetricMatchers = CustomMatchers
    }
}
export {}
