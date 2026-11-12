
import mongoose, { Schema } from "mongoose";
import { IPayment } from "../interfaces/payment.interface";

const paymentSchema = new Schema<IPayment>(
    {
        member: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        subscription: {
            type: Schema.Types.ObjectId,
            ref: "Subscription",
            required: true
        },
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        paymentMethod: {
            type: String,
            enum: ["CASH", "CARD", "BANK_TRANSFER"],
            required: true
        },
        paymentStatus: {
            type: String,
            enum: ["PAID", "PENDING", "FAILED"],
            default: "PENDING",
            required: true
        },
        paymentDate: {
            type: Date,
            default: Date.now,
            required: true
        },
        referenceNumber: {
            type: String,
            trim: true,
            sparse: true,
            unique: true
        },
        notes: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

paymentSchema.index({ member: 1 });
paymentSchema.index({ subscription: 1 });
paymentSchema.index({ paymentStatus: 1 });
paymentSchema.index({ paymentDate: -1 });

const Payment = mongoose.model<IPayment>("Payment", paymentSchema);

export default Payment;
