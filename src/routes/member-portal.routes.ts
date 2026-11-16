
import { Router } from "express";

import {
    getMySubscriptions,
    getMyAttendance,
    getMyPayments,
    getMyProgress
} from "../controllers/member-portal.controller";

import authenticate from "../middlewares/auth.middleware";
import authorizeRoles from "../middlewares/role.middleware";

const router = Router();

router.use(authenticate, authorizeRoles("MEMBER"));

router.get("/subscriptions", getMySubscriptions);
router.get("/attendance", getMyAttendance);
router.get("/payments", getMyPayments);
router.get("/progress", getMyProgress);

export default router;
