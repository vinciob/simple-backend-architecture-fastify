// Types
import type { FastifyReply, FastifyRequest } from "fastify"

export const getMe = async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send({user: request.user})
}