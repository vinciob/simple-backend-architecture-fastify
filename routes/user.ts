// Middleware
import { validateToken } from '../middleware/validateToken.js'
// Routes
import { editMe } from '../controllers/user/editMe.js'
import { deleteMe } from '../controllers/user/deleteMe.js'
// Types
import type { FastifyInstance, FastifyPluginAsync } from 'fastify'

//////////////////
// User Routes //
////////////////

export const userRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {

    // Edit User
    fastify.patch('/me', { preHandler: validateToken }, editMe)

    // Delete User
    fastify.delete('/me', { preHandler: validateToken }, deleteMe)

    
}
