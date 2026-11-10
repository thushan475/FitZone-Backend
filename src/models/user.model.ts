
import mongoose, { Schema } from "mongoose";
import { IUser } from "../interfaces/user.interface";

const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ["ADMIN", "TRAINER", "MEMBER"],
            default: "MEMBER"
        },
        isActive: {
            type: Boolean,
            default: true
        },
        specialization: {
            type: String,
            trim: true
        },
        experience: {
            type: Number,
            min: 0
        },
        qualifications: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
