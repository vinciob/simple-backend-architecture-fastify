// Entry point of the application
import { buildServer } from './app.js'
// Config and utilities
import { env } from './config/env.js'
import { connectDB } from './db/connection.js'
import { logger } from './lib/logger.js'


const startServer = async () => {
  
    try {
        // Connect to the database
        await connectDB()

        // Build the Fastify server
        const server = await buildServer()

        // Start scheduled tasks if enabled
        if (env.enableCron) {
            // If there are scheduled tasks, initialize them here
            // scheduleTasks()
        }

        // Start the server
        const port = env.port || 5001
        await server.listen({ port, host: '0.0.0.0' })
        
        // Log server start
        logger(`🚀 Server started on port ${port}`)

    } catch (error) {
        
        // Log server start failure
        logger('❌ Failed to start server', 'error')
        logger(error instanceof Error ? error.stack || error.message : String(error), 'error')

        // Exit the process with failure code
        process.exit(1)
        
    }
}

startServer()