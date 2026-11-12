export interface IMemberAnalytics {
    totalMembers: number;
    activeMembers: number;
    inactiveMembers: number;
    newMembersThisMonth: number;
}

export interface IRevenueAnalytics {
    totalRevenue: number;
    dailyRevenue: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
}

export interface IAttendanceAnalytics {
    totalAttendance: number;
    todayAttendance: number;
    monthlyAttendance: number;
}

export interface IMembershipAnalytics {
    activeMemberships: number;
    expiredMemberships: number;
    cancelledMemberships: number;
}

export interface IAnalyticsData {
    members: IMemberAnalytics;
    revenue: IRevenueAnalytics;
    attendance: IAttendanceAnalytics;
    memberships: IMembershipAnalytics;
}