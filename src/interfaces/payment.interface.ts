
import { Types } from "mongoose";

export type PaymentMethod = "CASH" | "CARD" | "BANK_TRANSFER";

export type PaymentStatus = "PAID" | "PENDING" | "FAILED";

export interface IPayment {
    member: Types.ObjectId;
    subscription: Types.ObjectId;
    amount: number;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    paymentDate: Date;
    referenceNumber?: string;
    notes?: string;
}
