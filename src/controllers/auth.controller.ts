
import { Request, Response } from "express";
import {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword
} from "../services/auth.service";
import User from "../models/user.model";

const register = async (req: Request, res: Response) => {
    try {
        const user = await registerUser(req.body);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: user
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Registration failed";

        res.status(400).json({
            success: false,
            message
        });
    }
};

const login = async (req: Request, res: Response) => {
    try {
        const result = await loginUser(req.body);

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: result
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Login failed";

        res.status(401).json({
            success: false,
            message
        });
    }
};

const getProfile = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.user?.userId).select("-password");

        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found"
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Profile retrieved successfully",
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve profile"
        });
    }
};

const forgotPasswordController = async (req: Request, res: Response) => {
    try {
        const email = req.body.email;

        if (!email || typeof email !== "string") {
            res.status(400).json({
                success: false,
                message: "Valid email address is required"
            });
            return;
        }

        await forgotPassword(email);

        res.status(200).json({
            success: true,
            message: "If an account exists with this email, a password reset link has been sent."
        });
    } catch (error) {
        console.error("Forgot password error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to send password reset email. Please try again later."
        });
    }
};

const resetPasswordController = async (req: Request, res: Response) => {
    try {
        const { token, newPassword } = req.body;

        if (
            typeof token !== "string" ||
            typeof newPassword !== "string"
        ) {
            res.status(400).json({
                success: false,
                message: "Token and new password are required"
            });
            return;
        }

        await resetPassword(token, newPassword);

        res.status(200).json({
            success: true,
            message: "Password reset successfully"
        });
    } catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Password reset failed";

        res.status(400).json({
            success: false,
            message
        });
    }
};

export {
    register,
    login,
    getProfile,
    forgotPasswordController,
    resetPasswordController
};
