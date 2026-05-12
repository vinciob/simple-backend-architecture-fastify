import dotenv from 'dotenv'
dotenv.config()

// Validate required environment variables
const requiredEnvs = ['PORT','DB_URI','JWT_SECRET'] as const

requiredEnvs.forEach((envName) => {
    if (!process.env[envName]) throw new Error(`Missing environment variable: ${envName}`)
})

export const env = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: Number(process.env.PORT),
    dbUri: process.env.DB_URI as string,
    feUrl: process.env.FRONTEND_URL as string || 'http://localhost:3000',
    enableCron: Boolean(process.env.ENABLE_CRON) || false,
    jwtSecret: process.env.JWT_SECRET as string,
}