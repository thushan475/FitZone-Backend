import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model";

interface RegisterInput {
    name: string;
    email: string;
    password: string;
    phone: string;
}

interface LoginInput {
    email: string;
    password: string;
}

const registerUser = async (data: RegisterInput) => {
    const existingUser = await User.findOne({
        email: data.email.toLowerCase()
    });

    if (existingUser) {
        throw new Error("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await User.create({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
        role: "MEMBER",
        isActive: true
    });

    const userObject = user.toObject();
    const { password, ...safeUser } = userObject;

    return safeUser;
};

const loginUser = async (data: LoginInput) => {
    const user = await User.findOne({
        email: data.email.toLowerCase()
    });

    if (!user || !user.isActive) {
        throw new Error("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(
        data.password,
        user.password
    );

    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        throw new Error("JWT_SECRET is not defined");
    }

    const token = jwt.sign(
        {
            userId: user._id.toString(),
            role: user.role
        },
        jwtSecret,
        {
            expiresIn: 86400
        }
    );

    const userObject = user.toObject();
    const { password, ...safeUser } = userObject;

    return {
        user: safeUser,
        token
    };
};

export { registerUser, loginUser };