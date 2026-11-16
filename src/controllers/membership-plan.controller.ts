
import { RequestHandler } from "express";
import {
    createMembershipPlan,
    getAllMembershipPlans,
    getMembershipPlanById,
    updateMembershipPlan,
    deleteMembershipPlan,
    activateMembershipPlan,
    MembershipPlanStatus
} from "../services/membership-plan.service";

const getId = (id: string | string[]) => {
    return Array.isArray(id) ? id[0] : id;
};

const getErrorMessage = (error: unknown, fallback: string) => {
    return error instanceof Error ? error.message : fallback;
};

const getStatusCode = (message: string) => {
    return message.includes("not found") ? 404 : 400;
};

const create: RequestHandler = async (req, res) => {
    try {
        const plan = await createMembershipPlan(req.body);

        res.status(201).json({
            success: true,
            message: "Membership plan created successfully",
            data: plan
        });
    } catch (error) {
        const message = getErrorMessage(
            error,
            "Membership plan creation failed"
        );

        res.status(400).json({
            success: false,
            message
        });
    }
};

const getAll: RequestHandler = async (req, res) => {
    try {
        const status = req.query.status
            ? String(req.query.status).toUpperCase()
            : "ALL";

        if (!["ACTIVE", "INACTIVE", "ALL"].includes(status)) {
            res.status(400).json({
                success: false,
                message: "Invalid status. Use ACTIVE, INACTIVE or ALL"
            });
            return;
        }

        const plans = await getAllMembershipPlans(
            status as MembershipPlanStatus
        );

        res.status(200).json({
            success: true,
            message: "Membership plans retrieved successfully",
            data: plans
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: getErrorMessage(
                error,
                "Failed to retrieve membership plans"
            )
        });
    }
};

const getById: RequestHandler = async (req, res) => {
    try {
        const plan = await getMembershipPlanById(getId(req.params.id));

        res.status(200).json({
            success: true,
            message: "Membership plan retrieved successfully",
            data: plan
        });
    } catch (error) {
        const message = getErrorMessage(
            error,
            "Failed to retrieve membership plan"
        );

        res.status(getStatusCode(message)).json({
            success: false,
            message
        });
    }
};

const update: RequestHandler = async (req, res) => {
    try {
        const plan = await updateMembershipPlan(
            getId(req.params.id),
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Membership plan updated successfully",
            data: plan
        });
    } catch (error) {
        const message = getErrorMessage(
            error,
            "Failed to update membership plan"
        );

        res.status(getStatusCode(message)).json({
            success: false,
            message
        });
    }
};

const remove: RequestHandler = async (req, res) => {
    try {
        const plan = await deleteMembershipPlan(getId(req.params.id));

        res.status(200).json({
            success: true,
            message: "Membership plan deactivated successfully",
            data: plan
        });
    } catch (error) {
        const message = getErrorMessage(
            error,
            "Failed to deactivate membership plan"
        );

        res.status(getStatusCode(message)).json({
            success: false,
            message
        });
    }
};

const activate: RequestHandler = async (req, res) => {
    try {
        const plan = await activateMembershipPlan(getId(req.params.id));

        res.status(200).json({
            success: true,
            message: "Membership plan activated successfully",
            data: plan
        });
    } catch (error) {
        const message = getErrorMessage(
            error,
            "Failed to activate membership plan"
        );

        res.status(getStatusCode(message)).json({
            success: false,
            message
        });
    }
};

export {
    create,
    getAll,
    getById,
    update,
    remove,
    activate
};
