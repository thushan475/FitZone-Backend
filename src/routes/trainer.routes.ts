
import { Router } from "express";
import {
    create,
    getAll,
    getById,
    update,
    remove
} from "../controllers/trainer.controller";
import authenticate from "../middlewares/auth.middleware";
import authorizeRoles from "../middlewares/role.middleware";

const router = Router();

router.post("/", authenticate, authorizeRoles("ADMIN"), create);
router.get("/", authenticate, authorizeRoles("ADMIN"), getAll);
router.get("/:id", authenticate, authorizeRoles("ADMIN"), getById);
router.put("/:id", authenticate, authorizeRoles("ADMIN"), update);
router.delete("/:id", authenticate, authorizeRoles("ADMIN"), remove);

export default router;
