
import User from "../models/user.model";
import Payment from "../models/payment.model";
import Attendance from "../models/attendance.model";
import Subscription from "../models/subscription.model";
import { IAnalyticsData } from "../interfaces/analytics.interface";

const getAnalyticsData = async (): Promise<IAnalyticsData> => {
    const now = new Date();
    const sriLankaOffset = 5.5 * 60 * 60 * 1000;
    const sriLankaNow = new Date(now.getTime() + sriLankaOffset);

    const getSriLankaDayStart = (date: Date) => {
        return new Date(
            Date.UTC(
                date.getUTCFullYear(),
                date.getUTCMonth(),
                date.getUTCDate()
            ) - sriLankaOffset
        );
    };

    const todayStart = getSriLankaDayStart(sriLankaNow);
    const tomorrowStart = new Date(todayStart.getTime() + 86400000);

    const monthStart = new Date(
        Date.UTC(
            sriLankaNow.getUTCFullYear(),
            sriLankaNow.getUTCMonth(),
            1
        ) - sriLankaOffset
    );

    const nextMonthStart = new Date(
        Date.UTC(
            sriLankaNow.getUTCFullYear(),
            sriLankaNow.getUTCMonth() + 1,
            1
        ) - sriLankaOffset
    );

    const yearStart = new Date(
        Date.UTC(
            sriLankaNow.getUTCFullYear(),
            0,
            1
        ) - sriLankaOffset
    );

    const nextYearStart = new Date(
        Date.UTC(
            sriLankaNow.getUTCFullYear() + 1,
            0,
            1
        ) - sriLankaOffset
    );

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
        Subscription.countDocuments({
            status: "ACTIVE",
            endDate: { $gte: now }
        }),
        Subscription.countDocuments({
            $or: [
                { status: "EXPIRED" },
                { status: "ACTIVE", endDate: { $lt: now } }
            ]
        }),
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
