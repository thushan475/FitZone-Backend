
import User from "../models/user.model";
import bcrypt from "bcryptjs";

interface CreateMemberInput {
    name: string;
    email: string;
    password: string;
    phone: string;
}

interface UpdateMemberInput {
    name?: string;
    email?: string;
    phone?: string;
}

type MemberStatus = "ACTIVE" | "INACTIVE" | "ALL";

const createMember = async (data: CreateMemberInput) => {
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

    if (!data.phone?.trim() || !/^0\d{9}$/.test(data.phone.trim())) {
        throw new Error("Invalid phone number");
    }

    const email = data.email.trim().toLowerCase();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new Error("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await User.create({
        name: data.name.trim(),
        email,
        password: hashedPassword,
        phone: data.phone.trim(),
        role: "MEMBER",
        isActive: true
    });

    const userObject = user.toObject();
    const { password, ...safeUser } = userObject;

    return safeUser;
};

const getAllMembers = async (
    status: MemberStatus = "ALL"
) => {
    const filter: Record<string, unknown> = {
        role: "MEMBER"
    };

    if (status === "ACTIVE") {
        filter.isActive = true;
    }

    if (status === "INACTIVE") {
        filter.isActive = false;
    }

    const members = await User.find(filter)
        .select("-password -resetPasswordToken -resetPasswordExpires")
        .sort({ createdAt: -1 });

    return members;
};

const getMemberById = async (id: string) => {
    const member = await User.findOne({
        _id: id,
        role: "MEMBER"
    }).select("-password -resetPasswordToken -resetPasswordExpires");

    if (!member) {
        throw new Error("Member not found");
    }

    return member;
};

const updateMember = async (
    id: string,
    data: UpdateMemberInput
) => {
    if (data.name !== undefined && !data.name.trim()) {
        throw new Error("Name cannot be empty");
    }

    if (data.email !== undefined) {
        const email = data.email.trim().toLowerCase();

        if (!email) {
            throw new Error("Email cannot be empty");
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new Error("Invalid email format");
        }

        const existingUser = await User.findOne({
            email,
            _id: { $ne: id }
        });

        if (existingUser) {
            throw new Error("Email already registered");
        }

        data.email = email;
    }

    if (data.phone !== undefined) {
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
            returnDocument: "after",
            runValidators: true
        }
    ).select("-password -resetPasswordToken -resetPasswordExpires");

    if (!member) {
        throw new Error("Active member not found");
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
            returnDocument: "after"
        }
    ).select("-password -resetPasswordToken -resetPasswordExpires");

    if (!member) {
        throw new Error("Active member not found");
    }

    return member;
};

const activateMember = async (id: string) => {
    const member = await User.findOneAndUpdate(
        {
            _id: id,
            role: "MEMBER",
            isActive: false
        },
        {
            $set: {
                isActive: true
            }
        },
        {
            returnDocument: "after"
        }
    ).select("-password -resetPasswordToken -resetPasswordExpires");

    if (!member) {
        throw new Error("Inactive member not found");
    }

    return member;
};

export {
    createMember,
    getAllMembers,
    getMemberById,
    updateMember,
    deleteMember,
    activateMember
};
