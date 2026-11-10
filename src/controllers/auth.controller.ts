import { Request, Response } from "express";
import { registerUser, loginUser } from "../services/auth.service";
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

export { register, login, getProfile };