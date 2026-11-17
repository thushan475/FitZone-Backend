
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./configs/database";

import authRoutes from "./routes/auth.routes";
import memberRoutes from "./routes/member.routes";
import memberPortalRoutes from "./routes/member-portal.routes";
import trainerRoutes from "./routes/trainer.routes";
import membershipPlanRoutes from "./routes/membership-plan.routes";
import subscriptionRoutes from "./routes/subscription.routes";
import attendanceRoutes from "./routes/attendance.routes";
import workoutPlanRoutes from "./routes/workout-plan.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import paymentRoutes from "./routes/payment.routes";
import analyticsRoutes from "./routes/analytics.routes";
import settingsRoutes from "./routes/settings.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({
        message: "FitZone Backend is running!"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/member", memberPortalRoutes);
app.use("/api/trainers", trainerRoutes);
app.use("/api/membership-plans", membershipPlanRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/workout-plans", workoutPlanRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/settings", settingsRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();
