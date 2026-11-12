
import mongoose from "mongoose";
import WorkoutPlan from "../models/workout-plan.model";
import User from "../models/user.model";
import {
    WorkoutGoal,
    IWorkoutExercise
} from "../interfaces/workout-plan.interface";

interface CreateWorkoutPlanInput {
    title: string;
    description?: string;
    memberId: string;
    trainerId: string;
    goal?: WorkoutGoal;
    startDate: string;
    endDate: string;
    exercises: IWorkoutExercise[];
    notes?: string;
}

interface UpdateWorkoutPlanInput {
    title?: string;
    description?: string;
    goal?: WorkoutGoal;
    startDate?: string;
    endDate?: string;
    exercises?: IWorkoutExercise[];
    notes?: string;
    isActive?: boolean;
}

const validateObjectId = (id: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid ID");
    }
};

const validateDate = (value: string): Date => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        throw new Error("Invalid date");
    }

    return date;
};

const validateGoal = (goal: string): WorkoutGoal => {
    const validGoals = [
        "WEIGHT_LOSS",
        "MUSCLE_GAIN",
        "GENERAL_FITNESS",
        "STRENGTH",
        "FLEXIBILITY"
    ];

    if (!validGoals.includes(goal)) {
        throw new Error("Invalid workout goal");
    }

    return goal as WorkoutGoal;
};

const validateExercises = (
    exercises: IWorkoutExercise[]
): IWorkoutExercise[] => {
    if (!Array.isArray(exercises) || exercises.length === 0) {
        throw new Error("At least one exercise is required");
    }

    return exercises.map(exercise => {
        if (
            !exercise ||
            typeof exercise.name !== "string" ||
            !exercise.name.trim()
        ) {
            throw new Error("Exercise name is required");
        }

        if (!Number.isInteger(exercise.sets) || exercise.sets < 1) {
            throw new Error("Exercise sets must be a positive integer");
        }

        if (!Number.isInteger(exercise.reps) || exercise.reps < 1) {
            throw new Error("Exercise reps must be a positive integer");
        }

        if (
            exercise.durationMinutes !== undefined &&
            (
                !Number.isInteger(exercise.durationMinutes) ||
                exercise.durationMinutes < 1
            )
        ) {
            throw new Error("Exercise duration must be a positive integer");
        }

        if (
            exercise.description !== undefined &&
            typeof exercise.description !== "string"
        ) {
            throw new Error("Exercise description must be a string");
        }

        return {
            name: exercise.name.trim(),
            description: exercise.description?.trim(),
            sets: exercise.sets,
            reps: exercise.reps,
            durationMinutes: exercise.durationMinutes
        };
    });
};

const populateWorkoutPlan = (query: any) => {
    return query
        .populate("member", "name email phone")
        .populate("trainer", "name email phone specialization");
};

export const createWorkoutPlan = async (
    data: CreateWorkoutPlanInput
) => {
    if (
        !data.memberId ||
        !data.trainerId ||
        !data.title ||
        !data.startDate ||
        !data.endDate
    ) {
        throw new Error("Required fields are missing");
    }

    validateObjectId(data.memberId);
    validateObjectId(data.trainerId);

    if (data.memberId === data.trainerId) {
        throw new Error("Member and trainer must be different users");
    }

    const member = await User.findOne({
        _id: data.memberId,
        role: "MEMBER",
        isActive: true
    });

    if (!member) {
        throw new Error("Active member not found");
    }

    const trainer = await User.findOne({
        _id: data.trainerId,
        role: "TRAINER",
        isActive: true
    });

    if (!trainer) {
        throw new Error("Active trainer not found");
    }

    if (typeof data.title !== "string" || !data.title.trim()) {
        throw new Error("Workout plan title is required");
    }

    if (
        data.description !== undefined &&
        typeof data.description !== "string"
    ) {
        throw new Error("Description must be a string");
    }

    if (
        data.notes !== undefined &&
        typeof data.notes !== "string"
    ) {
        throw new Error("Notes must be a string");
    }

    const startDate = validateDate(data.startDate);
    const endDate = validateDate(data.endDate);

    if (endDate <= startDate) {
        throw new Error("End date must be after start date");
    }

    const goal = data.goal
        ? validateGoal(data.goal)
        : "GENERAL_FITNESS";

    const exercises = validateExercises(data.exercises);

    const workoutPlan = await WorkoutPlan.create({
        title: data.title.trim(),
        description: data.description?.trim(),
        member: member._id,
        trainer: trainer._id,
        goal,
        startDate,
        endDate,
        exercises,
        notes: data.notes?.trim(),
        isActive: true
    });

    return populateWorkoutPlan(
        WorkoutPlan.findById(workoutPlan._id)
    );
};

export const getAllWorkoutPlans = async () => {
    return populateWorkoutPlan(
        WorkoutPlan.find().sort({ createdAt: -1 })
    );
};

export const getWorkoutPlanById = async (id: string) => {
    validateObjectId(id);

    const workoutPlan = await populateWorkoutPlan(
        WorkoutPlan.findById(id)
    );

    if (!workoutPlan) {
        throw new Error("Workout plan not found");
    }

    return workoutPlan;
};

export const updateWorkoutPlan = async (
    id: string,
    data: UpdateWorkoutPlanInput
) => {
    validateObjectId(id);

    const allowedFields = [
        "title",
        "description",
        "goal",
        "startDate",
        "endDate",
        "exercises",
        "notes",
        "isActive"
    ];

    const providedFields = Object.keys(data);

    if (providedFields.length === 0) {
        throw new Error("At least one field is required");
    }

    const invalidFields = providedFields.filter(
        field => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
        throw new Error("Invalid update fields");
    }

    const workoutPlan = await WorkoutPlan.findById(id);

    if (!workoutPlan) {
        throw new Error("Workout plan not found");
    }

    if (data.title !== undefined) {
        if (
            typeof data.title !== "string" ||
            !data.title.trim()
        ) {
            throw new Error("Workout plan title is required");
        }

        workoutPlan.title = data.title.trim();
    }

    if (data.description !== undefined) {
        if (typeof data.description !== "string") {
            throw new Error("Description must be a string");
        }

        workoutPlan.description = data.description.trim();
    }

    if (data.goal !== undefined) {
        workoutPlan.goal = validateGoal(data.goal);
    }

    if (data.startDate !== undefined) {
        workoutPlan.startDate = validateDate(data.startDate);
    }

    if (data.endDate !== undefined) {
        workoutPlan.endDate = validateDate(data.endDate);
    }

    if (workoutPlan.endDate <= workoutPlan.startDate) {
        throw new Error("End date must be after start date");
    }

    if (data.exercises !== undefined) {
        workoutPlan.exercises = validateExercises(data.exercises);
    }

    if (data.notes !== undefined) {
        if (typeof data.notes !== "string") {
            throw new Error("Notes must be a string");
        }

        workoutPlan.notes = data.notes.trim();
    }

    if (data.isActive !== undefined) {
        if (typeof data.isActive !== "boolean") {
            throw new Error("isActive must be a boolean");
        }

        workoutPlan.isActive = data.isActive;
    }

    await workoutPlan.save();

    return populateWorkoutPlan(
        WorkoutPlan.findById(workoutPlan._id)
    );
};

export const deleteWorkoutPlan = async (id: string) => {
    validateObjectId(id);

    const workoutPlan = await WorkoutPlan.findByIdAndDelete(id);

    if (!workoutPlan) {
        throw new Error("Workout plan not found");
    }

    return workoutPlan;
};
