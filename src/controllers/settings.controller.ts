
import { Request, Response } from "express";
import User from "../models/user.model";
import {
    getGymSettings,
    updateGymSettings,
    updateAdminProfile,
    changeAdminPassword
} from "../services/settings.service";

export const getSettings = async (req: Request, res: Response) => {
    try {
        const settings = await getGymSettings();

        const admin = await User.findById(req.user?.userId).select("-password");

        if (!admin) {
            res.status(404).json({
                success: false,
                message: "Admin not found"
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Settings retrieved successfully",
            data: {
                gym: settings,
                admin
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Failed to retrieve settings"
        });
    }
};

export const updateGymSettingsController = async (req: Request, res: Response) => {
    try {
        const {
            gymName,
            email,
            phone,
            address,
            openingTime,
            closingTime,
            operatingDays
        } = req.body;

        if (
            typeof gymName !== "string" ||
            typeof email !== "string" ||
            typeof phone !== "string" ||
            typeof address !== "string" ||
            typeof openingTime !== "string" ||
            typeof closingTime !== "string" ||
            !Array.isArray(operatingDays) ||
            !gymName.trim() ||
            !email.trim() ||
            !phone.trim() ||
            !address.trim()
        ) {
            res.status(400).json({
                success: false,
                message: "All gym settings fields are required"
            });
            return;
        }

        const settings = await updateGymSettings({
            gymName,
            email,
            phone,
            address,
            openingTime,
            closingTime,
            operatingDays
        });

        res.status(200).json({
            success: true,
            message: "Gym settings updated successfully",
            data: settings
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Failed to update gym settings"
        });
    }
};

export const updateAdminProfileController = async (req: Request, res: Response) => {
    try {
        const { name, email, phone } = req.body;

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof phone !== "string" ||
            !name.trim() ||
            !email.trim() ||
            !phone.trim()
        ) {
            res.status(400).json({
                success: false,
                message: "Name, email and phone are required"
            });
            return;
        }

        const admin = await updateAdminProfile(req.user!.userId, {
            name,
            email,
            phone
        });

        res.status(200).json({
            success: true,
            message: "Admin profile updated successfully",
            data: admin
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Failed to update admin profile"
        });
    }
};

export const changeAdminPasswordController = async (req: Request, res: Response) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (
            typeof currentPassword !== "string" ||
            typeof newPassword !== "string" ||
            !currentPassword ||
            !newPassword
        ) {
            res.status(400).json({
                success: false,
                message: "Current password and new password are required"
            });
            return;
        }

        const result = await changeAdminPassword(
            req.user!.userId,
            currentPassword,
            newPassword
        );

        res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Failed to change password"
        });
    }
};
