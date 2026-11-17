import User from "../models/user.model";
import Trainer from "../models/trainer.model";
import Subscription from "../models/subscription.model";
import Attendance from "../models/attendance.model";
import Payment from "../models/payment.model";

export const getDashboardData = async () => {
    const now = new Date();

    const sriLankaOffset = 5.5 * 60 * 60 * 1000;
    const sriLankaNow = new Date(now.getTime() + sriLankaOffset);

    const todayStart = new Date(
        Date.UTC(
            sriLankaNow.getUTCFullYear(),
            sriLankaNow.getUTCMonth(),
            sriLankaNow.getUTCDate()
        ) - sriLankaOffset
    );

    const tomorrowStart = new Date(
        todayStart.getTime() + 24 * 60 * 60 * 1000
    );

    const [
        totalMembers,
        totalTrainers,
        activeMemberships,
        todayAttendance,
        revenueResult
    ] = await Promise.all([
        User.countDocuments({
            role: "MEMBER",
            isActive: true
        }),

        Trainer.countDocuments({
            isActive: true
        }),

        Subscription.countDocuments({
            status: "ACTIVE"
        }),

        Attendance.countDocuments({
            attendanceDate: {
                $gte: todayStart,
                $lt: tomorrowStart
            }
        }),

        Payment.aggregate([
            {
                $match: {
                    paymentStatus: "PAID"
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: "$amount"
                    }
                }
            }
        ])
    ]);

    return {
        summary: {
            totalMembers,
            totalTrainers,
            activeMemberships,
            totalRevenue: revenueResult[0]?.totalRevenue || 0,
            todayAttendance
        }
    };
};