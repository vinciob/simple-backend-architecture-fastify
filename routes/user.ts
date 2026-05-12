// Middleware
import { validateToken } from '../middleware/validateToken.js'
// Routes
// import { loginUser } from '../controllers/auth/login'
// import { registerUser } from '../controllers/auth/register'
// import { getMe } from '../controllers/auth/me'
// Types
import type { FastifyInstance, FastifyPluginAsync } from 'fastify'

//////////////////
// User Routes //
////////////////

export const userRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {

    // Edit User
    // fastify.patch('/me', { preHandler: validateToken }, editMe)

    // Delete User
    // fastify.delete('/me', { preHandler: validateToken }, deleteMe)

    
}