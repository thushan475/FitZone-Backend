
import mongoose from "mongoose";
import Subscription from "../models/subscription.model";
import Attendance from "../models/attendance.model";
import Payment from "../models/payment.model";
import WorkoutPlan from "../models/workout-plan.model";

export const getMemberSubscriptions = async (userId: string) => {
    return Subscription.find({
        member: userId
    })
        .populate("plan", "name durationDays price")
        .sort({ createdAt: -1 });
};

export const getMemberAttendance = async (userId: string) => {
    return Attendance.find({
        member: userId
    })
        .sort({
            attendanceDate: -1,
            checkIn: -1
        });
};

export const getMemberPayments = async (userId: string) => {
    return Payment.find({
        member: userId
    })
        .populate("subscription", "planName planPrice status")
        .sort({ paymentDate: -1 });
};

export const getMemberProgressReport = async (userId: string) => {
    const now = new Date();

    const monthStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
    );

    const memberObjectId = new mongoose.Types.ObjectId(userId);

    const [
        totalAttendance,
        attendanceThisMonth,
        totalWorkoutPlans,
        activeWorkoutPlans,
        completedWorkoutPlans,
        activeSubscriptions,
        paymentSummary
    ] = await Promise.all([
        Attendance.countDocuments({
            member: userId
        }),

        Attendance.countDocuments({
            member: userId,
            attendanceDate: {
                $gte: monthStart,
                $lte: now
            }
        }),

        WorkoutPlan.countDocuments({
            member: userId
        }),

        WorkoutPlan.countDocuments({
            member: userId,
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        }),

        WorkoutPlan.countDocuments({
            member: userId,
            isActive: true,
            endDate: { $lt: now }
        }),

        Subscription.find({
            member: userId,
            status: "ACTIVE",
            endDate: { $gte: now }
        }).select("planName startDate endDate status"),

        Payment.aggregate([
            {
                $match: {
                    member: memberObjectId,
                    paymentStatus: "PAID"
                }
            },
            {
                $group: {
                    _id: null,
                    totalPaid: { $sum: "$amount" },
                    paidTransactions: { $sum: 1 }
                }
            }
        ])
    ]);

    return {
        attendance: {
            totalVisits: totalAttendance,
            visitsThisMonth: attendanceThisMonth
        },
        workoutPlans: {
            total: totalWorkoutPlans,
            currentlyActive: activeWorkoutPlans,
            completed: completedWorkoutPlans
        },
        subscriptions: {
            activeCount: activeSubscriptions.length,
            activeSubscriptions
        },
        payments: {
            totalPaid: paymentSummary[0]?.totalPaid || 0,
            paidTransactions: paymentSummary[0]?.paidTransactions || 0
        },
        generatedAt: now
    };
};
