
import { Request, Response, RequestHandler } from "express";

import {
    getMemberSubscriptions,
    getMemberAttendance,
    getMemberPayments,
    getMemberProgressReport
} from "../services/member-portal.service";

const getUserId = (
    req: Request,
    res: Response
): string | null => {
    const userId = req.user?.userId;

    if (!userId) {
        res.status(401).json({
            success: false,
            message: "User authentication required"
        });

        return null;
    }

    return userId;
};

export const getMySubscriptions: RequestHandler = (req, res) => {
    const userId = getUserId(req, res);

    if (!userId) return;

    getMemberSubscriptions(userId)
        .then(data => {
            res.status(200).json({
                success: true,
                message: "Your subscriptions retrieved successfully",
                data
            });
        })
        .catch(() => {
            res.status(500).json({
                success: false,
                message: "Failed to retrieve your subscriptions"
            });
        });
};

export const getMyAttendance: RequestHandler = (req, res) => {
    const userId = getUserId(req, res);

    if (!userId) return;

    getMemberAttendance(userId)
        .then(data => {
            res.status(200).json({
                success: true,
                message: "Your attendance retrieved successfully",
                data
            });
        })
        .catch(() => {
            res.status(500).json({
                success: false,
                message: "Failed to retrieve your attendance"
            });
        });
};

export const getMyPayments: RequestHandler = (req, res) => {
    const userId = getUserId(req, res);

    if (!userId) return;

    getMemberPayments(userId)
        .then(data => {
            res.status(200).json({
                success: true,
                message: "Your payments retrieved successfully",
                data
            });
        })
        .catch(() => {
            res.status(500).json({
                success: false,
                message: "Failed to retrieve your payments"
            });
        });
};

export const getMyProgress: RequestHandler = (req, res) => {
    const userId = getUserId(req, res);

    if (!userId) return;

    getMemberProgressReport(userId)
        .then(data => {
            res.status(200).json({
                success: true,
                message: "Your progress report retrieved successfully",
                data
            });
        })
        .catch(() => {
            res.status(500).json({
                success: false,
                message: "Failed to retrieve your progress report"
            });
        });
};
