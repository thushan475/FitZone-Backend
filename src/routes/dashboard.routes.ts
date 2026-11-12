
import { Router } from "express";
import { getDashboard } from "../controllers/dashboard.controller";
import authenticate from "../middlewares/auth.middleware";
import authorizeRoles from "../middlewares/role.middleware";

const router = Router();

router.get("/", authenticate, authorizeRoles("ADMIN"), getDashboard);

export default router;
