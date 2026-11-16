
import { Router } from "express";
import {
    create,
    getAll,
    getById,
    update,
    remove,
    activate
} from "../controllers/member.controller";
import authenticate from "../middlewares/auth.middleware";
import authorizeRoles from "../middlewares/role.middleware";

const router = Router();

router.use(authenticate, authorizeRoles("ADMIN"));

router.post("/", create);
router.get("/", getAll);
router.get("/:id", getById);
router.put("/:id", update);
router.patch("/:id/activate", activate);
router.delete("/:id", remove);

export default router;
