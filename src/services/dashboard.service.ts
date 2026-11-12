
import User from "../models/user.model";
import Subscription from "../models/subscription.model";
import Attendance from "../models/attendance.model";
import Payment from "../models/payment.model";

export const getDashboardData = async () => {
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
        User.countDocuments({
            role: "TRAINER",
            isActive: true
        }),
        Subscription.countDocuments({
            status: "ACTIVE"
        }),
        Attendance.countDocuments({
            date: {
                $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                $lt: new Date(new Date().setHours(24, 0, 0, 0))
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
