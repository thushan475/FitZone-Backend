
import mongoose from "mongoose";
import Subscription from "../models/subscription.model";
import MembershipPlan from "../models/membership-plan.model";
import User from "../models/user.model";
import { SubscriptionStatus } from "../interfaces/subscription.interface";

interface CreateSubscriptionInput {
    memberId: string;
    planId: string;
    startDate?: string;
    amountPaid?: number;
}

interface UpdateSubscriptionInput {
    memberId?: string;
    planId?: string;
    startDate?: string;
    amountPaid?: number;
    status?: SubscriptionStatus;
}

const validateId = (id: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid ID");
    }
};

const validateAmount = (amount: number) => {
    if (
        typeof amount !== "number" ||
        !Number.isFinite(amount) ||
        amount < 0
    ) {
        throw new Error("Amount paid must be a valid non-negative number");
    }
};

const parseDate = (date: string) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        throw new Error("Invalid start date");
    }

    return parsedDate;
};

const calculateEndDate = (startDate: Date, durationDays: number) => {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + durationDays);
    return endDate;
};

const populateSubscription = (query: any) => {
    return query
        .populate("member", "name email phone")
        .populate("plan", "name durationDays price");
};

const createSubscription = async (data: CreateSubscriptionInput) => {
    if (!data || typeof data !== "object") {
        throw new Error("Subscription data is required");
    }

    if (!data.memberId) {
        throw new Error("Member ID is required");
    }

    if (!data.planId) {
        throw new Error("Membership plan ID is required");
    }

    validateId(data.memberId);
    validateId(data.planId);

    const member = await User.findOne({
        _id: data.memberId,
        role: "MEMBER",
        isActive: true
    });

    if (!member) {
        throw new Error("Active member not found");
    }

    const plan = await MembershipPlan.findOne({
        _id: data.planId,
        isActive: true
    });

    if (!plan) {
        throw new Error("Active membership plan not found");
    }

    const startDate = data.startDate
        ? parseDate(data.startDate)
        : new Date();

    const amountPaid = data.amountPaid ?? 0;

    validateAmount(amountPaid);

    const endDate = calculateEndDate(
        startDate,
        plan.durationDays
    );

    const status = endDate <= new Date()
        ? "EXPIRED"
        : "ACTIVE";

    const subscription = await Subscription.create({
        member: member._id,
        plan: plan._id,
        planName: plan.name,
        planPrice: plan.price,
        durationDays: plan.durationDays,
        startDate,
        endDate,
        amountPaid,
        status
    });

    return populateSubscription(
        Subscription.findById(subscription._id)
    );
};

const getAllSubscriptions = async () => {
    return populateSubscription(
        Subscription.find()
    ).sort({ createdAt: -1 });
};

const getSubscriptionById = async (id: string) => {
    validateId(id);

    const subscription = await populateSubscription(
        Subscription.findById(id)
    );

    if (!subscription) {
        throw new Error("Subscription not found");
    }

    return subscription;
};

const updateSubscription = async (
    id: string,
    data: UpdateSubscriptionInput
) => {
    validateId(id);

    if (!data || typeof data !== "object") {
        throw new Error("Subscription update data is required");
    }

    const allowedFields = [
        "memberId",
        "planId",
        "startDate",
        "amountPaid",
        "status"
    ];

    const invalidFields = Object.keys(data).filter(
        (field) => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
        throw new Error(
            `Invalid update fields: ${invalidFields.join(", ")}`
        );
    }

    if (Object.keys(data).length === 0) {
        throw new Error("At least one field is required for update");
    }

    const subscription = await Subscription.findById(id);

    if (!subscription) {
        throw new Error("Subscription not found");
    }

    let startDate = subscription.startDate;
    let durationDays = subscription.durationDays;

    if (data.memberId !== undefined) {
        validateId(data.memberId);

        const member = await User.findOne({
            _id: data.memberId,
            role: "MEMBER",
            isActive: true
        });

        if (!member) {
            throw new Error("Active member not found");
        }

        subscription.member = member._id;
    }

    if (data.planId !== undefined) {
        validateId(data.planId);

        const plan = await MembershipPlan.findOne({
            _id: data.planId,
            isActive: true
        });

        if (!plan) {
            throw new Error("Active membership plan not found");
        }

        subscription.plan = plan._id;
        subscription.planName = plan.name;
        subscription.planPrice = plan.price;
        subscription.durationDays = plan.durationDays;

        durationDays = plan.durationDays;
    }

    if (data.startDate !== undefined) {
        if (typeof data.startDate !== "string" || !data.startDate) {
            throw new Error("Invalid start date");
        }

        startDate = parseDate(data.startDate);
        subscription.startDate = startDate;
    }

    if (data.amountPaid !== undefined) {
        validateAmount(data.amountPaid);
        subscription.amountPaid = data.amountPaid;
    }

    if (data.status !== undefined) {
        const allowedStatuses = [
            "ACTIVE",
            "EXPIRED",
            "CANCELLED"
        ];

        if (!allowedStatuses.includes(data.status)) {
            throw new Error("Invalid subscription status");
        }

        subscription.status = data.status;
    }

    subscription.endDate = calculateEndDate(
        startDate,
        durationDays
    );

    await subscription.save();

    return populateSubscription(
        Subscription.findById(subscription._id)
    );
};

const cancelSubscription = async (id: string) => {
    validateId(id);

    const subscription = await Subscription.findByIdAndUpdate(
        id,
        {
            $set: {
                status: "CANCELLED"
            }
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!subscription) {
        throw new Error("Subscription not found");
    }

    return populateSubscription(
        Subscription.findById(subscription._id)
    );
};

const renewSubscription = async (
    id: string,
    amountPaid?: number
) => {
    validateId(id);

    const subscription = await Subscription.findById(id);

    if (!subscription) {
        throw new Error("Subscription not found");
    }

    if (subscription.status === "CANCELLED") {
        throw new Error("Cancelled subscription cannot be renewed");
    }

    if (amountPaid !== undefined) {
        validateAmount(amountPaid);
    }

    const now = new Date();

    const baseDate = subscription.endDate > now
        ? subscription.endDate
        : now;

    subscription.startDate = baseDate;
    subscription.endDate = calculateEndDate(
        baseDate,
        subscription.durationDays
    );

    if (amountPaid !== undefined) {
        subscription.amountPaid += amountPaid;
    }

    subscription.status = "ACTIVE";

    await subscription.save();

    return populateSubscription(
        Subscription.findById(subscription._id)
    );
};

export {
    createSubscription,
    getAllSubscriptions,
    getSubscriptionById,
    updateSubscription,
    cancelSubscription,
    renewSubscription
};
