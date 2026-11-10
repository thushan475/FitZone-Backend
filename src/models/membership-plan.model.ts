
import mongoose, { Schema } from "mongoose";
import { IMembershipPlan } from "../interfaces/membership-plan.interface";

const membershipPlanSchema = new Schema<IMembershipPlan>(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        durationDays: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        features: {
            type: [String],
            default: []
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const MembershipPlan = mongoose.model<IMembershipPlan>(
    "MembershipPlan",
    membershipPlanSchema
);

export default MembershipPlan;
