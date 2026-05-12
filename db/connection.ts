import mongoose from 'mongoose'
import { env } from '../config/env.js'
import { logger } from '../lib/logger.js'

export const connectDB = async (): Promise<void> => {
    
    try {
        
        const dbUri = env.dbUri
        if (!dbUri) throw new Error('DB_URI is not defined')
        
        // Connect to MongoDB with a connection pool and timeout settings
        const conn = await mongoose.connect(dbUri, {
            maxPoolSize: 10, // Limit the number of concurrent connections
            serverSelectionTimeoutMS: 5000, // Timeout for initial connection
        })

        // Log successful connection
        logger(`MongoDB connected: ${conn.connection.host}`)

    } catch (error: unknown) {

        // Log connection error with stack trace if available
        const message = error instanceof Error ? error.message : 'Unknown database error'
        logger(`MongoDB connection error: ${message}`, 'error')
        throw error

    }

}