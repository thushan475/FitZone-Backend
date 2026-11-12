
import { Router } from "express";
import {
    create,
    getAll,
    getById,
    update,
    cancel,
    renew
} from "../controllers/subscription.controller";
import authenticate from "../middlewares/auth.middleware";
import authorizeRoles from "../middlewares/role.middleware";

const router = Router();

router.post("/", authenticate, authorizeRoles("ADMIN"), create);
router.get("/", authenticate, authorizeRoles("ADMIN"), getAll);
router.get("/:id", authenticate, authorizeRoles("ADMIN"), getById);
router.put("/:id", authenticate, authorizeRoles("ADMIN"), update);
router.patch("/:id/renew", authenticate, authorizeRoles("ADMIN"), renew);
router.delete("/:id", authenticate, authorizeRoles("ADMIN"), cancel);

export default router;
