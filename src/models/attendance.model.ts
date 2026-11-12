
import mongoose, { Schema } from "mongoose";
import { IAttendance } from "../interfaces/attendance.interface";

const attendanceSchema = new Schema<IAttendance>(
    {
        member: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        attendanceDate: {
            type: Date,
            required: true
        },
        checkIn: {
            type: Date,
            required: true
        },
        checkOut: {
            type: Date
        },
        status: {
            type: String,
            enum: ["PRESENT", "LATE"],
            default: "PRESENT",
            required: true
        },
        notes: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

attendanceSchema.index(
    { member: 1, attendanceDate: 1 },
    { unique: true }
);

export default mongoose.model<IAttendance>("Attendance", attendanceSchema);
