
import { Types } from "mongoose";

export type WorkoutGoal =
    | "WEIGHT_LOSS"
    | "MUSCLE_GAIN"
    | "GENERAL_FITNESS"
    | "STRENGTH"
    | "FLEXIBILITY";

export interface IWorkoutExercise {
    name: string;
    description?: string;
    sets: number;
    reps: number;
    durationMinutes?: number;
}

export interface IWorkoutPlan {
    title: string;
    description?: string;
    member: Types.ObjectId;
    trainer: Types.ObjectId;
    goal: WorkoutGoal;
    startDate: Date;
    endDate: Date;
    exercises: IWorkoutExercise[];
    notes?: string;
    isActive: boolean;
}
