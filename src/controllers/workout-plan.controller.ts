
import { RequestHandler } from "express";
import {
    createWorkoutPlan,
    getAllWorkoutPlans,
    getWorkoutPlanById,
    updateWorkoutPlan,
    deleteWorkoutPlan
} from "../services/workout-plan.service";

const getId = (value: string | string[] | undefined): string => {
    return Array.isArray(value) ? value[0] : value || "";
};

const getErrorMessage = (error: unknown): string => {
    return error instanceof Error
        ? error.message
        : "Internal server error";
};

const getStatusCode = (message: string): number => {
    return message.includes("not found") ? 404 : 400;
};

export const create = ((req, res) => {
    createWorkoutPlan(req.body)
        .then(data => {
            res.status(201).json({
                success: true,
                message: "Workout plan created successfully",
                data
            });
        })
        .catch(error => {
            const message = getErrorMessage(error);

            res.status(getStatusCode(message)).json({
                success: false,
                message
            });
        });
}) as RequestHandler;

export const getAll = ((req, res) => {
    getAllWorkoutPlans()
        .then(data => {
            res.status(200).json({
                success: true,
                message: "Workout plans retrieved successfully",
                data
            });
        })
        .catch(error => {
            res.status(500).json({
                success: false,
                message: getErrorMessage(error)
            });
        });
}) as RequestHandler;

export const getById = ((req, res) => {
    getWorkoutPlanById(getId(req.params.id))
        .then(data => {
            res.status(200).json({
                success: true,
                message: "Workout plan retrieved successfully",
                data
            });
        })
        .catch(error => {
            const message = getErrorMessage(error);

            res.status(getStatusCode(message)).json({
                success: false,
                message
            });
        });
}) as RequestHandler;

export const update = ((req, res) => {
    updateWorkoutPlan(getId(req.params.id), req.body)
        .then(data => {
            res.status(200).json({
                success: true,
                message: "Workout plan updated successfully",
                data
            });
        })
        .catch(error => {
            const message = getErrorMessage(error);

            res.status(getStatusCode(message)).json({
                success: false,
                message
            });
        });
}) as RequestHandler;

export const remove = ((req, res) => {
    deleteWorkoutPlan(getId(req.params.id))
        .then(data => {
            res.status(200).json({
                success: true,
                message: "Workout plan deleted successfully",
                data
            });
        })
        .catch(error => {
            const message = getErrorMessage(error);

            res.status(getStatusCode(message)).json({
                success: false,
                message
            });
        });
}) as RequestHandler;
