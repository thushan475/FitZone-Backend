
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
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

export const registerUser = async (input: RegisterInput) => {
    const { name, email, password, phone } = input;

    const existingUser = await User.findOne({
        email: email.toLowerCase().trim()
    });

    if (existingUser) {
        throw new Error("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        phone,
        role: "MEMBER",
        isActive: true
    });

    const { password: _password, ...safeUser } = user.toObject();

    return safeUser;
};

export const loginUser = async (input: LoginInput) => {
    const { email, password } = input;

    const user = await User.findOne({
        email: email.toLowerCase().trim()
    });

    if (!user) {
        throw new Error("Invalid email or password");
    }

    if (!user.isActive) {
        throw new Error("Account is inactive");
    }

    const isPasswordValid = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
        {
            userId: user._id,
            role: user.role
        },
        process.env.JWT_SECRET as string,
        {
            expiresIn: "86400s"
        }
    );

    const { password: _password, ...safeUser } = user.toObject();

    return {
        user: safeUser,
        token
    };
};

export const forgotPassword = async (email: string) => {
    const user = await User.findOne({
        email: email.toLowerCase().trim()
    });

    if (!user) {
        return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(
        Date.now() + 15 * 60 * 1000
    );

    await user.save();

    try {
        const smtpHost = process.env.SMTP_HOST;
        const smtpPort = Number(process.env.SMTP_PORT);
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;
        const smtpFrom = process.env.SMTP_FROM;
        const frontendUrl = process.env.FRONTEND_URL;


        if (
            !smtpHost ||
            !Number.isFinite(smtpPort) ||
            smtpPort <= 0 ||
            !smtpUser ||
            !smtpPass ||
            !smtpFrom ||
            !frontendUrl
        ) {
            throw new Error("Email configuration is incomplete");
        }

        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
                user: smtpUser,
                pass: smtpPass
            }
        });

        const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

        await transporter.sendMail({
            from: smtpFrom,
            to: user.email,
            subject: "FitZone - Password Reset",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>FitZone Password Reset</h2>
                    <p>You requested to reset your FitZone account password.</p>
                    <p>Click the button below to reset your password:</p>
                    <a href="${resetLink}" style="display:inline-block;padding:12px 20px;background-color:#16a34a;color:white;text-decoration:none;border-radius:6px;">
                        Reset Password
                    </a>
                    <p>This link expires in 15 minutes.</p>
                    <p>If you did not request this, please ignore this email.</p>
                </div>
            `
        });

    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        console.error("Forgot password error:", error);

        throw new Error(
            "Unable to send password reset email. Please try again later."
        );
    }
};

export const resetPassword = async (
    token: string,
    newPassword: string
) => {
    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: {
            $gt: new Date()
        }
    });

    if (!user) {
        throw new Error("Invalid or expired password reset token");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return {
        message: "Password reset successfully"
    };
};
