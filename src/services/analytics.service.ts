
import User from "../models/user.model";
import Payment from "../models/payment.model";
import Attendance from "../models/attendance.model";
import Subscription from "../models/subscription.model";
import { IAnalyticsData } from "../interfaces/analytics.interface";

const getAnalyticsData = async (): Promise<IAnalyticsData> => {
    const now = new Date();

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const yearStart = new Date(now.getFullYear(), 0, 1);
    const nextYearStart = new Date(now.getFullYear() + 1, 0, 1);

    const [
        totalMembers,
        activeMembers,
        inactiveMembers,
        newMembersThisMonth,
        dailyRevenueResult,
        monthlyRevenueResult,
        yearlyRevenueResult,
        totalRevenueResult,
        totalAttendance,
        todayAttendance,
        monthlyAttendance,
        activeMemberships,
        expiredMemberships,
        cancelledMemberships
    ] = await Promise.all([
        User.countDocuments({ role: "MEMBER" }),
        User.countDocuments({ role: "MEMBER", isActive: true }),
        User.countDocuments({ role: "MEMBER", isActive: false }),
        User.countDocuments({
            role: "MEMBER",
            createdAt: { $gte: monthStart, $lt: nextMonthStart }
        }),
        Payment.aggregate([
            {
                $match: {
                    paymentStatus: "PAID",
                    paymentDate: { $gte: todayStart, $lt: tomorrowStart }
                }
            },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]),
        Payment.aggregate([
            {
                $match: {
                    paymentStatus: "PAID",
                    paymentDate: { $gte: monthStart, $lt: nextMonthStart }
                }
            },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]),
        Payment.aggregate([
            {
                $match: {
                    paymentStatus: "PAID",
                    paymentDate: { $gte: yearStart, $lt: nextYearStart }
                }
            },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]),
        Payment.aggregate([
            { $match: { paymentStatus: "PAID" } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]),
        Attendance.countDocuments(),
        Attendance.countDocuments({
            attendanceDate: { $gte: todayStart, $lt: tomorrowStart }
        }),
        Attendance.countDocuments({
            attendanceDate: { $gte: monthStart, $lt: nextMonthStart }
        }),
        Subscription.countDocuments({ status: "ACTIVE" }),
        Subscription.countDocuments({ status: "EXPIRED" }),
        Subscription.countDocuments({ status: "CANCELLED" })
    ]);

    return {
        members: {
            totalMembers,
            activeMembers,
            inactiveMembers,
            newMembersThisMonth
        },
        revenue: {
            totalRevenue: totalRevenueResult[0]?.total || 0,
            dailyRevenue: dailyRevenueResult[0]?.total || 0,
            monthlyRevenue: monthlyRevenueResult[0]?.total || 0,
            yearlyRevenue: yearlyRevenueResult[0]?.total || 0
        },
        attendance: {
            totalAttendance,
            todayAttendance,
            monthlyAttendance
        },
        memberships: {
            activeMemberships,
            expiredMemberships,
            cancelledMemberships
        }
    };
};

export default { getAnalyticsData };
