
import mongoose, { Schema } from "mongoose";
import { IWorkoutPlan } from "../interfaces/workout-plan.interface";

const exerciseSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        sets: {
            type: Number,
            required: true,
            min: 1
        },
        reps: {
            type: Number,
            required: true,
            min: 1
        },
        durationMinutes: {
            type: Number,
            min: 1
        }
    },
    {
        _id: false
    }
);

const workoutPlanSchema = new Schema<IWorkoutPlan>(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        member: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        trainer: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        goal: {
            type: String,
            enum: [
                "WEIGHT_LOSS",
                "MUSCLE_GAIN",
                "GENERAL_FITNESS",
                "STRENGTH",
                "FLEXIBILITY"
            ],
            default: "GENERAL_FITNESS",
            required: true
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        exercises: {
            type: [exerciseSchema],
            required: true,
            validate: {
                validator: (value: unknown[]) => value.length > 0,
                message: "At least one exercise is required"
            }
        },
        notes: {
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

workoutPlanSchema.index({ member: 1, isActive: 1 });
workoutPlanSchema.index({ trainer: 1, isActive: 1 });

export default mongoose.model<IWorkoutPlan>(
    "WorkoutPlan",
    workoutPlanSchema
);
