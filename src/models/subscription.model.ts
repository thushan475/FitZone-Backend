
import mongoose, { Schema } from "mongoose";
import { ISubscription } from "../interfaces/subscription.interface";

const subscriptionSchema = new Schema<ISubscription>(
    {
        member: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        plan: {
            type: Schema.Types.ObjectId,
            ref: "MembershipPlan",
            required: true
        },
        planName: {
            type: String,
            required: true,
            trim: true
        },
        planPrice: {
            type: Number,
            required: true,
            min: 0
        },
        durationDays: {
            type: Number,
            required: true,
            min: 1
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        amountPaid: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },
        status: {
            type: String,
            enum: ["ACTIVE", "EXPIRED", "CANCELLED"],
            default: "ACTIVE",
            required: true
        }
    },
    {
        timestamps: true
    }
);

subscriptionSchema.index({ member: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ endDate: 1 });

const Subscription = mongoose.model<ISubscription>(
    "Subscription",
    subscriptionSchema
);

export default Subscription;
