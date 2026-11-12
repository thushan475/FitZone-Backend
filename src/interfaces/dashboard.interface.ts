
export interface IDashboardSummary {
    totalMembers: number;
    totalTrainers: number;
    activeMemberships: number;
    totalRevenue: number;
    todayAttendance: number;
}

export interface IRecentActivity {
    type: string;
    description: string;
    date: Date;
}

export interface IDashboardData {
    summary: IDashboardSummary;
    recentActivities: IRecentActivity[];
}
