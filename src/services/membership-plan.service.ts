
import mongoose from "mongoose";
import MembershipPlan from "../models/membership-plan.model";

interface CreateMembershipPlanInput {
    name: string;
    description?: string;
    durationDays: number;
    price: number;
    features?: string[];
}

interface UpdateMembershipPlanInput {
    name?: string;
    description?: string;
    durationDays?: number;
    price?: number;
    features?: string[];
}

const validatePlanData = (data: CreateMembershipPlanInput) => {
    if (typeof data.name !== "string" || !data.name.trim()) {
        throw new Error("Plan name is required");
    }

    if (
        !Number.isInteger(data.durationDays) ||
        data.durationDays < 1
    ) {
        throw new Error("Duration must be a positive whole number");
    }

    if (
        typeof data.price !== "number" ||
        !Number.isFinite(data.price) ||
        data.price < 0
    ) {
        throw new Error("Price must be a valid non-negative number");
    }

    if (
        data.description !== undefined &&
        typeof data.description !== "string"
    ) {
        throw new Error("Description must be a string");
    }

    if (
        data.features !== undefined &&
        (
            !Array.isArray(data.features) ||
            !data.features.every(
                (feature) =>
                    typeof feature === "string" && feature.trim().length > 0
            )
        )
    ) {
        throw new Error("Features must be a list of non-empty strings");
    }
};

const validatePlanId = (id: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid membership plan ID");
    }
};

const createMembershipPlan = async (data: CreateMembershipPlanInput) => {
    validatePlanData(data);

    const existingPlan = await MembershipPlan.findOne({
        name: {
            $regex: `^${data.name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
            $options: "i"
        }
    });

    if (existingPlan) {
        throw new Error("Membership plan name already exists");
    }

    const plan = await MembershipPlan.create({
        name: data.name.trim(),
        description: data.description?.trim(),
        durationDays: data.durationDays,
        price: data.price,
        features: data.features?.map((feature) => feature.trim()) ?? [],
        isActive: true
    });

    return plan;
};

const getAllMembershipPlans = async () => {
    return MembershipPlan.find({
        isActive: true
    }).sort({ createdAt: -1 });
};

const getMembershipPlanById = async (id: string) => {
    validatePlanId(id);

    const plan = await MembershipPlan.findOne({
        _id: id,
        isActive: true
    });

    if (!plan) {
        throw new Error("Membership plan not found");
    }

    return plan;
};

const updateMembershipPlan = async (
    id: string,
    data: UpdateMembershipPlanInput
) => {
    validatePlanId(id);

    const allowedFields = [
        "name",
        "description",
        "durationDays",
        "price",
        "features"
    ];

    const invalidFields = Object.keys(data).filter(
        (field) => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
        throw new Error(`Invalid update fields: ${invalidFields.join(", ")}`);
    }

    if (Object.keys(data).length === 0) {
        throw new Error("At least one field is required for update");
    }

    if (data.name !== undefined) {
        if (typeof data.name !== "string" || !data.name.trim()) {
            throw new Error("Plan name cannot be empty");
        }

        const existingPlan = await MembershipPlan.findOne({
            _id: { $ne: id },
            name: {
                $regex: `^${data.name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
                $options: "i"
            }
        });

        if (existingPlan) {
            throw new Error("Membership plan name already exists");
        }

        data.name = data.name.trim();
    }

    if (data.description !== undefined) {
        if (typeof data.description !== "string") {
            throw new Error("Description must be a string");
        }

        data.description = data.description.trim();
    }

    if (
        data.durationDays !== undefined &&
        (
            !Number.isInteger(data.durationDays) ||
            data.durationDays < 1
        )
    ) {
        throw new Error("Duration must be a positive whole number");
    }

    if (
        data.price !== undefined &&
        (
            typeof data.price !== "number" ||
            !Number.isFinite(data.price) ||
            data.price < 0
        )
    ) {
        throw new Error("Price must be a valid non-negative number");
    }

    if (data.features !== undefined) {
        if (
            !Array.isArray(data.features) ||
            !data.features.every(
                (feature) =>
                    typeof feature === "string" && feature.trim().length > 0
            )
        ) {
            throw new Error("Features must be a list of non-empty strings");
        }

        data.features = data.features.map((feature) => feature.trim());
    }

    const plan = await MembershipPlan.findOneAndUpdate(
        {
            _id: id,
            isActive: true
        },
        {
            $set: data
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!plan) {
        throw new Error("Membership plan not found");
    }

    return plan;
};

const deleteMembershipPlan = async (id: string) => {
    validatePlanId(id);

    const plan = await MembershipPlan.findOneAndUpdate(
        {
            _id: id,
            isActive: true
        },
        {
            $set: {
                isActive: false
            }
        },
        {
            new: true
        }
    );

    if (!plan) {
        throw new Error("Membership plan not found");
    }

    return plan;
};

export {
    createMembershipPlan,
    getAllMembershipPlans,
    getMembershipPlanById,
    updateMembershipPlan,
    deleteMembershipPlan
};
