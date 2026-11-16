
import { Router } from "express";
import {
    register,
    login,
    getProfile,
    forgotPasswordController,
    resetPasswordController
} from "../controllers/auth.controller";
import authenticate from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password", resetPasswordController);
router.get("/me", authenticate, getProfile);

export default router;
