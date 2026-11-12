
import { Types } from "mongoose";

export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELLED";

export interface ISubscription {
    member: Types.ObjectId;
    plan: Types.ObjectId;
    planName: string;
    planPrice: number;
    durationDays: number;
    startDate: Date;
    endDate: Date;
    amountPaid: number;
    status: SubscriptionStatus;
}
