
import mongoose from "mongoose";
import MembershipPlan from "../models/membership-plan.model";

export type MembershipPlanStatus = "ACTIVE" | "INACTIVE" | "ALL";

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

const validatePlanId = (id: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid membership plan ID");
    }
};

const validatePlanData = (data: CreateMembershipPlanInput) => {
    if (!data || typeof data !== "object") {
        throw new Error("Membership plan data is required");
    }

    if (typeof data.name !== "string" || !data.name.trim()) {
        throw new Error("Plan name is required");
    }

    if (!Number.isInteger(data.durationDays) || data.durationDays < 1) {
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
                    typeof feature === "string" &&
                    feature.trim().length > 0
            )
        )
    ) {
        throw new Error("Features must be a list of non-empty strings");
    }
};

const createMembershipPlan = async (data: CreateMembershipPlanInput) => {
    validatePlanData(data);

    const name = data.name.trim();

    const existingPlan = await MembershipPlan.findOne({
        name: {
            $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
            $options: "i"
        }
    });

    if (existingPlan) {
        throw new Error("Membership plan name already exists");
    }

    return MembershipPlan.create({
        name,
        description: data.description?.trim(),
        durationDays: data.durationDays,
        price: data.price,
        features: data.features?.map((feature) => feature.trim()) ?? [],
        isActive: true
    });
};

const getAllMembershipPlans = async (
    status: MembershipPlanStatus = "ALL"
) => {
    const filter: Record<string, unknown> = {};

    if (status === "ACTIVE") {
        filter.isActive = true;
    } else if (status === "INACTIVE") {
        filter.isActive = false;
    }

    return MembershipPlan.find(filter).sort({ createdAt: -1 });
};

const getMembershipPlanById = async (id: string) => {
    validatePlanId(id);

    const plan = await MembershipPlan.findById(id);

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

    if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new Error("Membership plan update data is required");
    }

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
        throw new Error(
            `Invalid update fields: ${invalidFields.join(", ")}`
        );
    }

    if (Object.keys(data).length === 0) {
        throw new Error("At least one field is required for update");
    }

    if (data.name !== undefined) {
        if (typeof data.name !== "string" || !data.name.trim()) {
            throw new Error("Plan name cannot be empty");
        }

        const name = data.name.trim();

        const existingPlan = await MembershipPlan.findOne({
            _id: { $ne: id },
            name: {
                $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
                $options: "i"
            }
        });

        if (existingPlan) {
            throw new Error("Membership plan name already exists");
        }

        data.name = name;
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
                    typeof feature === "string" &&
                    feature.trim().length > 0
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
            $set: { isActive: false }
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

const activateMembershipPlan = async (id: string) => {
    validatePlanId(id);

    const plan = await MembershipPlan.findOneAndUpdate(
        {
            _id: id,
            isActive: false
        },
        {
            $set: { isActive: true }
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!plan) {
        throw new Error("Inactive membership plan not found");
    }

    return plan;
};

export {
    createMembershipPlan,
    getAllMembershipPlans,
    getMembershipPlanById,
    updateMembershipPlan,
    deleteMembershipPlan,
    activateMembershipPlan
};
