import z from 'zod';
// Models
import { User, UserCreateZ, UserOutputZ } from '../../entities/user.entity.js';
// Utils
import { generateUserToken, hashPassword } from '../../lib/authUtils.js';
import { logger } from '../../lib/logger.js';
// Types
import type { FastifyRequest, FastifyReply } from 'fastify'

export const registerUser = async (request: FastifyRequest, reply: FastifyReply) : Promise<void> => {

    // Validate user fields
    const validateUser = UserCreateZ.safeParse(request.body)
    if (!validateUser.success) {
        const error = z.treeifyError(validateUser.error)
        logger(`User fields validation error: ${JSON.stringify(error)}`, 'error')
        return reply.status(400).send({
            message: "User fields not valid", 
            details: error.properties
        })
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: validateUser.data.email })
    if (userExists) { 
        logger('User already exists', 'error')
        return reply.status(409).send({message: "User already exists"})
    }

    // Hash password
    const hashedPassword : string = await hashPassword(validateUser.data.password)

    // Create user
    let newUser
    try {
        newUser = await User.create({ ...validateUser.data, password: hashedPassword})
    } catch (error: unknown) {

        // Handle duplicate key error (e.g., email already exists)
        if ( error instanceof Error && 'code' in error && error.code === 11000 ) {
            logger('Duplicate key error', 'error')
            return reply.status(409).send({message: 'Resource already exists'})
        }

        // Handle validation errors
        logger(`Error creating new user: ${String(error)}`, 'error')
        return reply.status(500).send({message: 'Error creating new user'})
    }

    if (!newUser) {
        logger('Error creating new user', 'error')
        return reply.status(500).send({message: "Error creating new user"})
    }

    // Prepare user output
    const outputUser = UserOutputZ.safeParse(newUser.toObject())
    if (!outputUser.success) return reply.status(500).send({ message: 'Error preparing user output' })
    const user = outputUser.data

    // Generate token
    const token = generateUserToken(newUser._id.toString())

    return reply.status(201).send({ user, token })
}