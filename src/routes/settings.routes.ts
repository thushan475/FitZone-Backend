
import { Router } from "express";
import authenticate from "../middlewares/auth.middleware";
import authorizeRoles from "../middlewares/role.middleware";
import {
    getSettings,
    updateGymSettingsController,
    updateAdminProfileController,
    changeAdminPasswordController
} from "../controllers/settings.controller";

const router = Router();

router.use(authenticate, authorizeRoles("ADMIN"));

router.get("/", getSettings);
router.put("/gym", updateGymSettingsController);
router.put("/profile", updateAdminProfileController);
router.put("/change-password", changeAdminPasswordController);

export default router;
