
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/user.model";
import { UserRole } from "../interfaces/user.interface";

interface AuthUser {
    userId: string;
    role: UserRole;
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}

const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
            success: false,
            message: "Authentication token required"
        });
        return;
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
        res.status(401).json({
            success: false,
            message: "Authentication token required"
        });
        return;
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        res.status(500).json({
            success: false,
            message: "JWT_SECRET is not defined"
        });
        return;
    }

    let userId: string;

    try {
        const decoded = jwt.verify(token, jwtSecret);

        if (
            typeof decoded === "string" ||
            typeof decoded.userId !== "string" ||
            !mongoose.Types.ObjectId.isValid(decoded.userId)
        ) {
            res.status(401).json({
                success: false,
                message: "Invalid authentication token"
            });
            return;
        }

        userId = decoded.userId;
    } catch {
        res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
        return;
    }

    try {
        const user = await User.findById(userId)
            .select("_id role isActive");

        if (!user || !user.isActive) {
            res.status(401).json({
                success: false,
                message: "Account is inactive or no longer exists"
            });
            return;
        }

        req.user = {
            userId: user._id.toString(),
            role: user.role
        };

        next();
    } catch {
        res.status(500).json({
            success: false,
            message: "Authentication verification failed"
        });
    }
};

export default authenticate;
