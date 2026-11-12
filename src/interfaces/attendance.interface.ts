
import { Types } from "mongoose";

export type AttendanceStatus = "PRESENT" | "LATE";

export interface IAttendance {
    member: Types.ObjectId;
    attendanceDate: Date;
    checkIn: Date;
    checkOut?: Date;
    status: AttendanceStatus;
    notes?: string;
}
