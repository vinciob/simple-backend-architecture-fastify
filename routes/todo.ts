// Middleware
import { validateToken } from '../middleware/validateToken.js'
// Routes
import { getTodos } from '../controllers/todo/getTodos.js'
import { createTodo } from '../controllers/todo/createTodo.js'
import { deleteTodo } from '../controllers/todo/deleteTodo.js'
import { getTodoById } from '../controllers/todo/getTodoById.js'
import { reopenTodo } from '../controllers/todo/reopenTodo.js'
import { editTodo } from '../controllers/todo/editTodo.js'
import { completeTodo } from '../controllers/todo/completeTodo.js'
// Types
import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
//////////////////
// Todo Routes //
////////////////

export const todoRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    
    // Get Todos list
    fastify.get('/', { preHandler: validateToken }, getTodos)

    // Create Todo
    fastify.post('/', { preHandler: validateToken }, createTodo)
    
    // Get Todo by ID
    fastify.get('/:todoId', { preHandler: validateToken }, getTodoById)

    // Edit Todo
    fastify.patch('/:todoId', { preHandler: validateToken }, editTodo)
    
    // Delete Todo
    fastify.delete('/:todoId', { preHandler: validateToken }, deleteTodo)

    // Complete Todo
    fastify.patch('/:todoId/complete', { preHandler: validateToken }, completeTodo)

    // Reopen Todo
    fastify.patch('/:todoId/reopen', { preHandler: validateToken }, reopenTodo)
    
}
