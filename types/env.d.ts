declare global {
    namespace NodeJS {
        interface ProcessEnv {
            SERVER_PORT: number
            SERVER_HOST: string
            SERVER_DATABASE_URL: string
            SERVER_DATABASE_ENCRYPTION_KEY: string
            SERVER_CORS_ORIGIN: string
        }
    }
}

export {}
