import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface TokenPayload {
    userId: string;
    role: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}

const authenticate = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                success: false,
                message: "Authentication token required"
            });
            return;
        }

        const token = authHeader.split(" ")[1];
        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            res.status(500).json({
                success: false,
                message: "JWT_SECRET is not defined"
            });
            return;
        }

        const decoded = jwt.verify(token, jwtSecret) as TokenPayload;

        req.user = decoded;

        next();
    } catch {
        res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

export default authenticate;