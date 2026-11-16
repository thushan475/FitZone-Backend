
import { RequestHandler } from "express";
import {
    createTrainer,
    getAllTrainers,
    getTrainerById,
    updateTrainer,
    deleteTrainer,
    activateTrainer
} from "../services/trainer.service";

const getId = (id: string | string[]) => {
    return Array.isArray(id) ? id[0] : id;
};

const create: RequestHandler = (req, res) => {
    createTrainer(req.body)
        .then((trainer) => {
            res.status(201).json({
                success: true,
                message: "Trainer created successfully",
                data: trainer
            });
        })
        .catch((error) => {
            res.status(400).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Trainer creation failed"
            });
        });
};

const getAll: RequestHandler = (req, res) => {
    const status = typeof req.query.status === "string"
        ? req.query.status.toUpperCase()
        : "ALL";

    if (!["ACTIVE", "INACTIVE", "ALL"].includes(status)) {
        res.status(400).json({
            success: false,
            message: "Invalid trainer status"
        });
        return;
    }

    getAllTrainers(status as "ACTIVE" | "INACTIVE" | "ALL")
        .then((trainers) => {
            res.status(200).json({
                success: true,
                message: "Trainers retrieved successfully",
                data: trainers
            });
        })
        .catch(() => {
            res.status(500).json({
                success: false,
                message: "Failed to retrieve trainers"
            });
        });
};

const getById: RequestHandler = (req, res) => {
    getTrainerById(getId(req.params.id))
        .then((trainer) => {
            res.status(200).json({
                success: true,
                message: "Trainer retrieved successfully",
                data: trainer
            });
        })
        .catch((error) => {
            res.status(404).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Trainer not found"
            });
        });
};

const update: RequestHandler = (req, res) => {
    updateTrainer(getId(req.params.id), req.body)
        .then((trainer) => {
            res.status(200).json({
                success: true,
                message: "Trainer updated successfully",
                data: trainer
            });
        })
        .catch((error) => {
            const message = error instanceof Error
                ? error.message
                : "Failed to update trainer";

            res.status(message === "Trainer not found" ? 404 : 400).json({
                success: false,
                message
            });
        });
};

const remove: RequestHandler = (req, res) => {
    deleteTrainer(getId(req.params.id))
        .then((trainer) => {
            res.status(200).json({
                success: true,
                message: "Trainer deactivated successfully",
                data: trainer
            });
        })
        .catch((error) => {
            res.status(404).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Failed to deactivate trainer"
            });
        });
};

const activate: RequestHandler = (req, res) => {
    activateTrainer(getId(req.params.id))
        .then((trainer) => {
            res.status(200).json({
                success: true,
                message: "Trainer activated successfully",
                data: trainer
            });
        })
        .catch((error) => {
            res.status(404).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Failed to activate trainer"
            });
        });
};

export {
    create,
    getAll,
    getById,
    update,
    remove,
    activate
};
