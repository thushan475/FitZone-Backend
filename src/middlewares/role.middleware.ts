import { Request, Response, NextFunction } from "express";
import { UserRole } from "../interfaces/user.interface";

const authorizeRoles = (...allowedRoles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: "Authentication required"
            });
            return;
        }

        if (!allowedRoles.includes(req.user.role as UserRole)) {
            res.status(403).json({
                success: false,
                message: "You do not have permission to access this resource"
            });
            return;
        }

        next();
    };
};

export default authorizeRoles;