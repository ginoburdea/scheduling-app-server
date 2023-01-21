declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PORT: number
            HOST: string
            DATABASE_URL: string
            DATABASE_ENCRYPTION_KEY: string
            CORS_ORIGIN: string
        }
    }
}

export {}
