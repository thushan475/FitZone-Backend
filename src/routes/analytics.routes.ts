import { Router } from "express";
import authenticate from "../middlewares/auth.middleware";
import authorizeRoles from "../middlewares/role.middleware";
import { getAnalytics } from "../controllers/analytics.controller";

const router = Router();

router.get("/", authenticate, authorizeRoles("ADMIN"), getAnalytics);

export default router;