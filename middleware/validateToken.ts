import jwt, { type JwtPayload } from 'jsonwebtoken'
// Models
import { User } from '../entities/user.entity.js'
// Config
import { env } from '../config/env.js'
// Types
import type { FastifyRequest, FastifyReply } from 'fastify'

type AccessTokenPayload = JwtPayload & {
    user_id: string
}

export type AuthUser = {
    _id: string
    email: string
    firstName: string
    lastName: string
}

// Extend FastifyRequest to include user information
declare module 'fastify' {
    interface FastifyRequest {
        user?: AuthUser
    } 
}


export const validateToken = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {

    const authorization = request.headers.authorization
    if (!authorization) return reply.status(401).send({ message: 'Unauthorized: no token' })

    // get token from header
    const token = authorization.split(' ')[1]
    if (!token) return reply.status(401).send({ message: 'Unauthorized: no token' })

    // Verify token and attach user info to request
    try {
        const decoded = jwt.verify(token, env.jwtSecret) as AccessTokenPayload
        if (!decoded.user_id) return reply.status(401).send({ message: 'Unauthorized: invalid token' })

        const user = await User.findById(decoded.user_id).select("firstName lastName email isActive").lean()
        if (!user) return reply.status(401).send({ message: 'Invalid Token' })
        if (!user.isActive) return reply.status(403).send({ message: 'User account is disabled' })

        request.user = {
            _id: user._id.toString(),
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
        }
    } catch {
        return reply.status(401).send({ message: 'Unauthorized: invalid token' })
    }
}