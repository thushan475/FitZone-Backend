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

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";
const REFRESH_TOKEN_DURATION = 7 * 24 * 60 * 60 * 1000;

const getJwtSecrets = () => {
    const accessSecret = process.env.JWT_SECRET;
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET;

    if (!accessSecret || !refreshSecret) {
        throw new Error("JWT secrets are not configured");
    }

    return { accessSecret, refreshSecret };
};

const createAccessToken = (user: {
    _id: unknown;
    role: string;
}) => {
    const { accessSecret } = getJwtSecrets();

    return jwt.sign(
        {
            userId: user._id,
            role: user.role
        },
        accessSecret,
        {
            expiresIn: ACCESS_TOKEN_EXPIRY
        }
    );
};

const createRefreshToken = (userId: string) => {
    const { refreshSecret } = getJwtSecrets();

    return jwt.sign(
        {
            userId,
            tokenType: "refresh"
        },
        refreshSecret,
        {
            expiresIn: REFRESH_TOKEN_EXPIRY
        }
    );
};

const hashToken = (token: string) => {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
};

const createTokenPair = (user: {
    _id: unknown;
    role: string;
}) => {
    const userId = String(user._id);

    return {
        token: createAccessToken(user),
        refreshToken: createRefreshToken(userId)
    };
};

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

    const tokens = createTokenPair(user);

    user.refreshTokenHash = hashToken(tokens.refreshToken);
    user.refreshTokenExpiresAt = new Date(
        Date.now() + REFRESH_TOKEN_DURATION
    );

    await user.save();

    const { password: _password, ...safeUser } = user.toObject();

    return {
        user: safeUser,
        token: tokens.token,
        refreshToken: tokens.refreshToken
    };
};

export const refreshAuthToken = async (refreshToken: string) => {
    if (!refreshToken) {
        throw new Error("Refresh token is required");
    }

    const { refreshSecret } = getJwtSecrets();

    let decoded: jwt.JwtPayload;

    try {
        const verified = jwt.verify(refreshToken, refreshSecret);

        if (
            typeof verified === "string" ||
            typeof verified.userId !== "string" ||
            verified.tokenType !== "refresh"
        ) {
            throw new Error("Invalid refresh token");
        }

        decoded = verified;
    } catch {
        throw new Error("Invalid or expired refresh token");
    }

    const user = await User.findById(decoded.userId);

    if (
        !user ||
        !user.isActive ||
        !user.refreshTokenHash ||
        !user.refreshTokenExpiresAt ||
        user.refreshTokenExpiresAt.getTime() <= Date.now()
    ) {
        throw new Error("Refresh session expired. Please login again.");
    }

    const incomingHash = hashToken(refreshToken);

    if (incomingHash !== user.refreshTokenHash) {
        throw new Error("Refresh token is no longer valid");
    }

    const tokens = createTokenPair(user);

    user.refreshTokenHash = hashToken(tokens.refreshToken);
    user.refreshTokenExpiresAt = new Date(
        Date.now() + REFRESH_TOKEN_DURATION
    );

    await user.save();

    return {
        token: tokens.token,
        refreshToken: tokens.refreshToken
    };
};

export const logoutUser = async (refreshToken?: string) => {
    if (!refreshToken) {
        return;
    }

    const incomingHash = hashToken(refreshToken);

    await User.updateOne(
        {
            refreshTokenHash: incomingHash
        },
        {
            $set: {
                refreshTokenHash: null,
                refreshTokenExpiresAt: null
            }
        }
    );
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
    user.refreshTokenHash = null;
    user.refreshTokenExpiresAt = null;

    await user.save();

    return {
        message: "Password reset successfully"
    };
};
