import { RequestHandler } from "express";
import analyticsService from "../services/analytics.service";

export const getAnalytics: RequestHandler = (_req, res) => {
    analyticsService.getAnalyticsData()
        .then((data) => {
            res.status(200).json({
                success: true,
                message: "Analytics data retrieved successfully",
                data
            });
        })
        .catch((error: Error) => {
            res.status(500).json({
                success: false,
                message: error.message || "Failed to retrieve analytics data"
            });
        });
};