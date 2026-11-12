
import { RequestHandler } from "express";
import {
    createSubscription,
    getAllSubscriptions,
    getSubscriptionById,
    updateSubscription,
    cancelSubscription,
    renewSubscription
} from "../services/subscription.service";

const getId = (id: string | string[]) => {
    return Array.isArray(id) ? id[0] : id;
};

const getErrorMessage = (error: unknown, fallback: string) => {
    return error instanceof Error ? error.message : fallback;
};

const getStatusCode = (message: string) => {
    return message.includes("not found") ? 404 : 400;
};

const create: RequestHandler = (req, res) => {
    createSubscription(req.body)
        .then((subscription) => {
            res.status(201).json({
                success: true,
                message: "Subscription created successfully",
                data: subscription
            });
        })
        .catch((error) => {
            res.status(400).json({
                success: false,
                message: getErrorMessage(
                    error,
                    "Subscription creation failed"
                )
            });
        });
};

const getAll: RequestHandler = (_req, res) => {
    getAllSubscriptions()
        .then((subscriptions) => {
            res.status(200).json({
                success: true,
                message: "Subscriptions retrieved successfully",
                data: subscriptions
            });
        })
        .catch(() => {
            res.status(500).json({
                success: false,
                message: "Failed to retrieve subscriptions"
            });
        });
};

const getById: RequestHandler = (req, res) => {
    getSubscriptionById(getId(req.params.id))
        .then((subscription) => {
            res.status(200).json({
                success: true,
                message: "Subscription retrieved successfully",
                data: subscription
            });
        })
        .catch((error) => {
            const message = getErrorMessage(
                error,
                "Failed to retrieve subscription"
            );

            res.status(getStatusCode(message)).json({
                success: false,
                message
            });
        });
};

const update: RequestHandler = (req, res) => {
    updateSubscription(getId(req.params.id), req.body)
        .then((subscription) => {
            res.status(200).json({
                success: true,
                message: "Subscription updated successfully",
                data: subscription
            });
        })
        .catch((error) => {
            const message = getErrorMessage(
                error,
                "Failed to update subscription"
            );

            res.status(getStatusCode(message)).json({
                success: false,
                message
            });
        });
};

const cancel: RequestHandler = (req, res) => {
    cancelSubscription(getId(req.params.id))
        .then((subscription) => {
            res.status(200).json({
                success: true,
                message: "Subscription cancelled successfully",
                data: subscription
            });
        })
        .catch((error) => {
            const message = getErrorMessage(
                error,
                "Failed to cancel subscription"
            );

            res.status(getStatusCode(message)).json({
                success: false,
                message
            });
        });
};

const renew: RequestHandler = (req, res) => {
    renewSubscription(
        getId(req.params.id),
        req.body?.amountPaid
    )
        .then((subscription) => {
            res.status(200).json({
                success: true,
                message: "Subscription renewed successfully",
                data: subscription
            });
        })
        .catch((error) => {
            const message = getErrorMessage(
                error,
                "Failed to renew subscription"
            );

            res.status(getStatusCode(message)).json({
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
    cancel,
    renew
};
