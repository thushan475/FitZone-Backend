
import { Router } from "express";
import {
    createPaymentController,
    getAllPaymentsController,
    getPaymentByIdController,
    updatePaymentController,
    deletePaymentController
} from "../controllers/payment.controller";
import authenticate from "../middlewares/auth.middleware";
import authorizeRoles from "../middlewares/role.middleware";

const router = Router();

router.use(authenticate, authorizeRoles("ADMIN"));

router.post("/", createPaymentController);
router.get("/", getAllPaymentsController);
router.get("/:id", getPaymentByIdController);
router.put("/:id", updatePaymentController);
router.delete("/:id", deletePaymentController);

export default router;
