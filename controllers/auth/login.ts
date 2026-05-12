import z from 'zod'
// Models
import { User, UserLoginZ, UserOutputZ } from '../../entities/user.entity.js'
// Utils
import { comparePassword, generateUserToken } from '../../lib/authUtils.js'
import { logger } from '../../lib/logger.js'
// Types
import type { FastifyReply, FastifyRequest } from 'fastify'


export const loginUser = async (request: FastifyRequest, reply: FastifyReply)=> {

    // Validate input
    const validateLogin = UserLoginZ.safeParse(request.body)
    if (!validateLogin.success) {
        const error = z.treeifyError(validateLogin.error)
        return reply.status(400).send({message: 'Login fields not valid', details: error.properties})
    }
    const { email, password } = validateLogin.data

    // Find user by email
    const user = await User.findOne({ email }).select('+password')

    // Check if user exists and is active
    if (!user) return reply.status(401).send({message: 'Invalid email or password'})
    if (!user.isActive) return reply.status(403).send({message: 'User account is disabled'})

    // Compare passwords
    const isPasswordValid = await comparePassword(password, user.password)
    if (!isPasswordValid) return reply.status(401).send({message: 'Invalid email or password'})

    // Validate user output
    const outputUser = UserOutputZ.safeParse(user.toObject())
    if (!outputUser.success) {
        logger('User output validation error', 'error')
        return reply.status(500).send({message: 'Error preparing user output'})
    }

    // Generate user token
    const token = generateUserToken(user._id.toString())
    return reply.status(200).send({user: outputUser.data, token})
}