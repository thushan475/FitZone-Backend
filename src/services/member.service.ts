
import User from "../models/user.model";
import bcrypt from "bcryptjs";

const createMember = async (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
}) => {
    if (!data.name?.trim()) {
        throw new Error("Name is required");
    }

    if (!data.email?.trim()) {
        throw new Error("Email is required");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        throw new Error("Invalid email format");
    }

    if (!data.password || data.password.length < 8) {
        throw new Error("Password must be at least 8 characters");
    }

    if (!data.phone?.trim()) {
        throw new Error("Phone number is required");
    }

    if (!/^0\d{9}$/.test(data.phone)) {
        throw new Error("Invalid phone number");
    }

    const existingUser = await User.findOne({
        email: data.email.trim().toLowerCase()
    });

    if (existingUser) {
        throw new Error("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await User.create({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: hashedPassword,
        phone: data.phone.trim(),
        role: "MEMBER",
        isActive: true
    });

    const userObject = user.toObject();
    const { password, ...safeUser } = userObject;

    return safeUser;
};

const getAllMembers = async () => {
    const members = await User.find({
        role: "MEMBER",
        isActive: true
    }).select("-password");

    return members;
};

const getMemberById = async (id: string) => {
    const member = await User.findOne({
        _id: id,
        role: "MEMBER",
        isActive: true
    }).select("-password");

    if (!member) {
        throw new Error("Member not found");
    }

    return member;
};

const updateMember = async (
    id: string,
    data: {
        name?: string;
        email?: string;
        phone?: string;
    }
) => {
    if (data.name !== undefined && !data.name.trim()) {
        throw new Error("Name cannot be empty");
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
        if (!data.phone.trim()) {
            throw new Error("Phone number cannot be empty");
        }

        if (!/^0\d{9}$/.test(data.phone.trim())) {
            throw new Error("Invalid phone number");
        }

        data.phone = data.phone.trim();
    }

    if (data.name !== undefined) {
        data.name = data.name.trim();
    }

    const member = await User.findOneAndUpdate(
        {
            _id: id,
            role: "MEMBER",
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

    if (!member) {
        throw new Error("Member not found");
    }

    return member;
};

const deleteMember = async (id: string) => {
    const member = await User.findOneAndUpdate(
        {
            _id: id,
            role: "MEMBER",
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

    if (!member) {
        throw new Error("Member not found");
    }

    return member;
};

export {
    createMember,
    getAllMembers,
    getMemberById,
    updateMember,
    deleteMember
};
