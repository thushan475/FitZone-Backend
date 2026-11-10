
import User from "../models/user.model";
import bcrypt from "bcryptjs";

interface CreateTrainerInput {
    name: string;
    email: string;
    password: string;
    phone: string;
    specialization: string;
    experience?: number;
    qualifications?: string;
}

interface UpdateTrainerInput {
    name?: string;
    email?: string;
    phone?: string;
    specialization?: string;
    experience?: number;
    qualifications?: string;
}

const createTrainer = async (data: CreateTrainerInput) => {
    if (!data.name?.trim()) {
        throw new Error("Name is required");
    }

    if (!data.email?.trim()) {
        throw new Error("Email is required");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
        throw new Error("Invalid email format");
    }

    if (!data.password || data.password.length < 8) {
        throw new Error("Password must be at least 8 characters");
    }

    if (!data.phone?.trim() || !/^0\d{9}$/.test(data.phone.trim())) {
        throw new Error("Invalid phone number");
    }

    if (!data.specialization?.trim()) {
        throw new Error("Specialization is required");
    }

    if (
        data.experience !== undefined &&
        (!Number.isFinite(data.experience) || data.experience < 0)
    ) {
        throw new Error("Experience must be a valid non-negative number");
    }

    const existingUser = await User.findOne({
        email: data.email.trim().toLowerCase()
    });

    if (existingUser) {
        throw new Error("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const trainer = await User.create({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: hashedPassword,
        phone: data.phone.trim(),
        role: "TRAINER",
        specialization: data.specialization.trim(),
        experience: data.experience,
        qualifications: data.qualifications?.trim(),
        isActive: true
    });

    const trainerObject = trainer.toObject();
    const { password, ...safeTrainer } = trainerObject;

    return safeTrainer;
};

const getAllTrainers = async () => {
    const trainers = await User.find({
        role: "TRAINER",
        isActive: true
    }).select("-password");

    return trainers;
};

const getTrainerById = async (id: string) => {
    const trainer = await User.findOne({
        _id: id,
        role: "TRAINER",
        isActive: true
    }).select("-password");

    if (!trainer) {
        throw new Error("Trainer not found");
    }

    return trainer;
};

const updateTrainer = async (
    id: string,
    data: UpdateTrainerInput
) => {
    if (Object.keys(data).length === 0) {
        throw new Error("At least one field is required for update");
    }

    if (data.name !== undefined) {
        if (!data.name.trim()) {
            throw new Error("Name cannot be empty");
        }

        data.name = data.name.trim();
    }

    if (data.email !== undefined) {
        if (!data.email.trim()) {
            throw new Error("Email cannot be empty");
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
            throw new Error("Invalid email format");
        }

        const existingUser = await User.findOne({
            email: data.email.trim().toLowerCase(),
            _id: { $ne: id }
        });

        if (existingUser) {
            throw new Error("Email already registered");
        }

        data.email = data.email.trim().toLowerCase();
    }

    if (data.phone !== undefined) {
        if (!/^0\d{9}$/.test(data.phone.trim())) {
            throw new Error("Invalid phone number");
        }

        data.phone = data.phone.trim();
    }

    if (data.specialization !== undefined) {
        if (!data.specialization.trim()) {
            throw new Error("Specialization cannot be empty");
        }

        data.specialization = data.specialization.trim();
    }

    if (
        data.experience !== undefined &&
        (!Number.isFinite(data.experience) || data.experience < 0)
    ) {
        throw new Error("Experience must be a valid non-negative number");
    }

    if (data.qualifications !== undefined) {
        data.qualifications = data.qualifications.trim();
    }

    const trainer = await User.findOneAndUpdate(
        {
            _id: id,
            role: "TRAINER",
            isActive: true
        },
        {
            $set: data
        },
        {
            new: true,
            runValidators: true
        }
    ).select("-password");

    if (!trainer) {
        throw new Error("Trainer not found");
    }

    return trainer;
};

const deleteTrainer = async (id: string) => {
    const trainer = await User.findOneAndUpdate(
        {
            _id: id,
            role: "TRAINER",
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
    ).select("-password");

    if (!trainer) {
        throw new Error("Trainer not found");
    }

    return trainer;
};

export {
    createTrainer,
    getAllTrainers,
    getTrainerById,
    updateTrainer,
    deleteTrainer
};
