import mongoose, { Schema } from "mongoose";
import { ITrainer } from "../interfaces/trainer.interface";

const trainerSchema = new Schema<ITrainer>(
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
        phone: {
            type: String,
            required: true
        },
        specialization: {
            type: String,
            required: true,
            trim: true
        },
        experience: {
            type: Number,
            min: 0
        },
        qualifications: {
            type: String,
            trim: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const Trainer = mongoose.model<ITrainer>("Trainer", trainerSchema);

export default Trainer;