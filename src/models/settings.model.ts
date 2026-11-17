import mongoose, { Schema } from "mongoose";
import { ISettings } from "../interfaces/settings.interface";

const settingsSchema = new Schema<ISettings>(
    {
        gymName: {
            type: String,
            required: true,
            trim: true,
            default: "FitZone Fitness Center"
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: ""
        },
        phone: {
            type: String,
            trim: true,
            default: ""
        },
        address: {
            type: String,
            trim: true,
            default: ""
        },
        openingTime: {
            type: String,
            required: true,
            default: "06:00"
        },
        closingTime: {
            type: String,
            required: true,
            default: "22:00"
        },
        operatingDays: {
            type: [String],
            default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        }
    },
    {
        timestamps: true
    }
);

const Settings = mongoose.model<ISettings>("Settings", settingsSchema);

export default Settings;