
import { RequestHandler } from "express";
import { getDashboardData } from "../services/dashboard.service";

export const getDashboard = ((req, res) => {
    getDashboardData()
        .then(data => {
            res.status(200).json({
                success: true,
                message: "Dashboard data retrieved successfully",
                data
            });
        })
        .catch(error => {
            res.status(500).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Internal server error"
            });
        });
}) as RequestHandler;
