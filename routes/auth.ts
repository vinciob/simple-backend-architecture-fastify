// Middleware
import { validateToken } from '../middleware/validateToken.js'
// Routes
import { loginUser } from '../controllers/auth/login.js'
import { registerUser } from '../controllers/auth/register.js'
import { getMe } from '../controllers/auth/me.js'
// Types
import type { FastifyInstance, FastifyPluginAsync } from 'fastify'

//////////////////
// Auth Routes //
////////////////

export const authRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {

    // Login User
    fastify.post('/login', loginUser)

    // Register User
    fastify.post('/register', registerUser)

    // Me Route (Protected)
    fastify.get('/me', { preHandler: validateToken }, getMe)
    
}