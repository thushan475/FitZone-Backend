import Trainer from "../models/trainer.model";

interface CreateTrainerInput {
    name: string;
    email: string;
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

    const existingTrainer = await Trainer.findOne({
        email: data.email.trim().toLowerCase()
    });

    if (existingTrainer) {
        throw new Error("Email already registered");
    }

    return await Trainer.create({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        specialization: data.specialization.trim(),
        experience: data.experience,
        qualifications: data.qualifications?.trim(),
        isActive: true
    });
};

const getAllTrainers = async () => {
    return await Trainer.find({ isActive: true });
};

const getTrainerById = async (id: string) => {
    const trainer = await Trainer.findOne({
        _id: id,
        isActive: true
    });

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
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
            throw new Error("Invalid email format");
        }

        data.email = data.email.trim().toLowerCase();

        const existingTrainer = await Trainer.findOne({
            email: data.email,
            _id: { $ne: id }
        });

        if (existingTrainer) {
            throw new Error("Email already registered");
        }
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

    const trainer = await Trainer.findOneAndUpdate(
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

    if (!trainer) {
        throw new Error("Trainer not found");
    }

    return trainer;
};

const deleteTrainer = async (id: string) => {
    const trainer = await Trainer.findOneAndUpdate(
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