interface CustomMatchers<R = unknown> {
    toMatchDto(dto: ClassConstructor<any>, printErrors?: boolean): Promise<R>
    toMatchError(error: string): Promise<R>
}

declare module 'expect' {
    interface AsymmetricMatchers extends CustomMatchers {}
    interface Matchers extends CustomMatchers {}
}
export {}
