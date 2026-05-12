// Fastify server setup
import Fastify from 'fastify'
import cors from '@fastify/cors'
import fastifyCookie from '@fastify/cookie'
// Config
import { env } from './config/env.js'
// Utils
import { logger } from './lib/logger.js'
// Routes
import { authRoutes } from './routes/auth.js'
import { todoRoutes } from './routes/todo.js'
// Types
import type { FastifyInstance, FastifyError, FastifyRequest, FastifyReply } from 'fastify'

export const buildServer = async (): Promise<FastifyInstance> => {
    
    // Create Fastify instance
    const fastify = Fastify({
        logger: false, // Using custom logger
    })

    // Register plugins
    await fastify.register(fastifyCookie)
    await fastify.register(cors, {
        origin: env.feUrl,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    })

    // Register routes
    await fastify.register(authRoutes, { prefix: '/auth' })
    // await fastify.register(usersRoutes, { prefix: '/users' })
    await fastify.register(todoRoutes, { prefix: '/todos' })

    // Global error handler
    fastify.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
        logger(error.stack || error.message, 'error')
        const isProduction = env.nodeEnv === 'production'
        reply.status(500).send({
            message: isProduction ? 'Internal Server Error' : error.message,
        })
    })

    // Return the Fastify instance
    return fastify
}
