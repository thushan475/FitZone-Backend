export type UserRole = "ADMIN" | "MEMBER";

export interface IUser {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: UserRole;
    isActive: boolean;
    resetPasswordToken?: string | null;
    resetPasswordExpires?: Date | null;
    refreshTokenHash?: string | null;
    refreshTokenExpiresAt?: Date | null;
}
