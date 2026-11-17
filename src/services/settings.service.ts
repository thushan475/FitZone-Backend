
import bcrypt from "bcryptjs";
import Settings from "../models/settings.model";
import User from "../models/user.model";

export const getGymSettings = async () => {
    let settings = await Settings.findOne();

    if (!settings) {
        settings = await Settings.create({
            gymName: "FitZone Fitness Center",
            email: "",
            phone: "",
            address: "",
            openingTime: "06:00",
            closingTime: "22:00",
            operatingDays: [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday"
            ]
        });
    }

    return settings;
};

export const updateGymSettings = async (data: {
    gymName: string;
    email: string;
    phone: string;
    address: string;
    openingTime: string;
    closingTime: string;
    operatingDays: string[];
}) => {
    const settings = await getGymSettings();

    Object.assign(settings, data);

    await settings.save();

    return settings;
};

export const updateAdminProfile = async (
    userId: string,
    data: {
        name: string;
        email: string;
        phone: string;
    }
) => {
    const existingUser = await User.findOne({
        email: data.email.toLowerCase().trim(),
        _id: { $ne: userId }
    });

    if (existingUser) {
        throw new Error("Email already registered");
    }

    const user = await User.findByIdAndUpdate(
        userId,
        {
            name: data.name.trim(),
            email: data.email.toLowerCase().trim(),
            phone: data.phone.trim()
        },
        {
            new: true,
            runValidators: true
        }
    ).select("-password");

    if (!user) {
        throw new Error("Admin not found");
    }

    return user;
};

export const changeAdminPassword = async (
    userId: string,
    currentPassword: string,
    newPassword: string
) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("Admin not found");
    }

    const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
    );

    if (!isPasswordValid) {
        throw new Error("Current password is incorrect");
    }

    if (newPassword.length < 8) {
        throw new Error("New password must contain at least 8 characters");
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    return {
        message: "Password changed successfully"
    };
};
