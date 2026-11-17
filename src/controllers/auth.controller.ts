import { Request, Response } from "express";
import {
    registerUser,
    loginUser,
    refreshAuthToken,
    logoutUser,
    forgotPassword,
    resetPassword
} from "../services/auth.service";
import User from "../models/user.model";

const isProduction = process.env.NODE_ENV === "production";

const refreshCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
    path: "/api/auth",
    maxAge: 7 * 24 * 60 * 60 * 1000
};

const clearRefreshCookie = (res: Response) => {
    res.clearCookie("fitzone_refresh_token", {
        httpOnly: true,
        secure: isProduction,
        sameSite: refreshCookieOptions.sameSite,
        path: "/api/auth"
    });
};

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

        res.cookie(
            "fitzone_refresh_token",
            result.refreshToken,
            refreshCookieOptions
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: result.user,
                token: result.token
            }
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Login failed";

        res.status(401).json({
            success: false,
            message
        });
    }
};

const refresh = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies?.fitzone_refresh_token;

        if (!refreshToken || typeof refreshToken !== "string") {
            res.status(401).json({
                success: false,
                message: "Refresh token required"
            });
            return;
        }

        const result = await refreshAuthToken(refreshToken);

        res.cookie(
            "fitzone_refresh_token",
            result.refreshToken,
            refreshCookieOptions
        );

        res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
            data: {
                token: result.token
            }
        });
    } catch (error) {
        clearRefreshCookie(res);

        res.status(401).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Unable to refresh token"
        });
    }
};

const logout = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies?.fitzone_refresh_token;

        await logoutUser(
            typeof refreshToken === "string" ? refreshToken : undefined
        );

        clearRefreshCookie(res);

        res.status(200).json({
            success: true,
            message: "Logout successful"
        });
    } catch {
        clearRefreshCookie(res);

        res.status(500).json({
            success: false,
            message: "Logout failed"
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
    } catch {
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
    } catch {
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

        clearRefreshCookie(res);

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
    refresh,
    logout,
    getProfile,
    forgotPasswordController,
    resetPasswordController
};
