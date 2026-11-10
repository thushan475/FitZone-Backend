import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "../configs/database";
import User from "../models/user.model";
import mongoose from "mongoose";

dotenv.config();

const createAdmin = async () => {
    try {
        await connectDB();

        const name = process.env.ADMIN_NAME;
        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;
        const phone = process.env.ADMIN_PHONE;

        if (!name || !email || !password || !phone) {
            throw new Error("Admin environment variables are missing");
        }

        const existingAdmin = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingAdmin) {
            console.log("Admin account already exists");
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            role: "ADMIN",
            isActive: true
        });

        console.log("Admin account created successfully");
    } catch (error) {
        console.error("Admin creation failed:", error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

createAdmin();