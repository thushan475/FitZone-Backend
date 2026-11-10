
import { RequestHandler } from "express";
import {
    createMembershipPlan,
    getAllMembershipPlans,
    getMembershipPlanById,
    updateMembershipPlan,
    deleteMembershipPlan
} from "../services/membership-plan.service";

const getId = (id: string | string[]) => {
    return Array.isArray(id) ? id[0] : id;
};

const create: RequestHandler = (req, res) => {
    createMembershipPlan(req.body)
        .then((plan) => {
            res.status(201).json({
                success: true,
                message: "Membership plan created successfully",
                data: plan
            });
        })
        .catch((error) => {
            const message = error instanceof Error
                ? error.message
                : "Membership plan creation failed";

            res.status(400).json({
                success: false,
                message
            });
        });
};

const getAll: RequestHandler = (_req, res) => {
    getAllMembershipPlans()
        .then((plans) => {
            res.status(200).json({
                success: true,
                message: "Membership plans retrieved successfully",
                data: plans
            });
        })
        .catch(() => {
            res.status(500).json({
                success: false,
                message: "Failed to retrieve membership plans"
            });
        });
};

const getById: RequestHandler = (req, res) => {
    getMembershipPlanById(getId(req.params.id))
        .then((plan) => {
            res.status(200).json({
                success: true,
                message: "Membership plan retrieved successfully",
                data: plan
            });
        })
        .catch((error) => {
            const message = error instanceof Error
                ? error.message
                : "Failed to retrieve membership plan";

            const statusCode = message === "Membership plan not found"
                ? 404
                : 400;

            res.status(statusCode).json({
                success: false,
                message
            });
        });
};

const update: RequestHandler = (req, res) => {
    updateMembershipPlan(getId(req.params.id), req.body)
        .then((plan) => {
            res.status(200).json({
                success: true,
                message: "Membership plan updated successfully",
                data: plan
            });
        })
        .catch((error) => {
            const message = error instanceof Error
                ? error.message
                : "Failed to update membership plan";

            const statusCode = message === "Membership plan not found"
                ? 404
                : 400;

            res.status(statusCode).json({
                success: false,
                message
            });
        });
};

const remove: RequestHandler = (req, res) => {
    deleteMembershipPlan(getId(req.params.id))
        .then((plan) => {
            res.status(200).json({
                success: true,
                message: "Membership plan deactivated successfully",
                data: plan
            });
        })
        .catch((error) => {
            const message = error instanceof Error
                ? error.message
                : "Failed to deactivate membership plan";

            const statusCode = message === "Membership plan not found"
                ? 404
                : 400;

            res.status(statusCode).json({
                success: false,
                message
            });
        });
};

export {
    create,
    getAll,
    getById,
    update,
    remove
};
