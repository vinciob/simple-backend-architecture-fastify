import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';


export const hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10)
    const res = await bcrypt.hash(password, salt)
    return res
}

export const comparePassword = async (candidatePassword: string, password: string) => {
    const res = await bcrypt.compare(candidatePassword, password)
    return res
}

export const generateUserToken = (user_id: string): string => {
    const payload = { userId: user_id }
    return jwt.sign( payload, env.jwtSecret as string, { expiresIn: '30d' } )
}