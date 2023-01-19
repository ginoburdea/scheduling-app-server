interface User {
    id: number
    email: string
}

declare module 'fastify' {
    interface FastifyRequest {
        user?: User
        sessionId?: number
    }
}

export {}
