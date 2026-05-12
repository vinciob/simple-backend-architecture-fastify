import mongoose, { Model } from 'mongoose';
import z from 'zod';
// Utils
import { ObjectIdZ } from '../lib/validateObjectId.js';

// User Types
export const userSexValues = ['male', 'female', 'other'] as const
export type TUserSex = (typeof userSexValues)[number]


//////////////////////
// MONGOOSE SCHEMA //
////////////////////

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    sex: { type: String, enum: userSexValues },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    password: { type: String, required: true, select: false },
    phone: { type: String },
    isActive: { type: Boolean, default: true },
}, { timestamps: true })


/////////////////
// ZOD SCHEMA //
///////////////

const UserZ = z.object({
    firstName: z.string().min(2).max(100),
    lastName: z.string().min(2).max(100),
    sex: z.enum(userSexValues).optional(),
    email: z.email(),
    // min 8 characters, at least one number, one uppercase and one lowercase letter
    password: z.string().min(8, 'Password must be at least 8 characters long')
        .regex(/\d/, 'Password must contain at least one number')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter'),
    phone: z.string().optional(),
    isActive: z.boolean().default(true),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
    __v: z.number().optional(),
})

export const UserLoginZ = UserZ.pick({
    email: true,
    password: true,
})

// Input validation schemas
export const UserCreateZ = UserZ.pick({
    firstName: true,
    lastName: true,
    sex: true,
    email: true,
    password: true,
    phone: true,
})

// For updates, all fields are optional
export const UserUpdateZ = UserZ.pick({
    firstName: true,
    lastName: true,
    sex: true,
    phone: true,
    isActive: true,
}).partial()

// Output schema (exclude password and __v, include _id)
export const UserOutputZ = UserZ.omit({
    password: true,
    __v: true,
}).extend({
    _id: ObjectIdZ
})

// Export TypeScript types
export type TUser = z.infer<typeof UserZ>;
export type TCreateUser = z.infer<typeof UserCreateZ>;
export type TLoginUser = z.infer<typeof UserLoginZ>;
export type TUpdateUser = z.infer<typeof UserUpdateZ>;
export type TUserOutput = z.infer<typeof UserOutputZ>;


/////////////////////
// MONGOOSE MODEL //
///////////////////

// TypeScript interfaces for Mongoose
export interface UserDoc extends mongoose.Document, TUser {}
export interface UserModel extends Model<UserDoc> {}

// Create and export the Mongoose model
export const User = mongoose.model<UserDoc, UserModel>('User', userSchema)
