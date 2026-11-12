
import mongoose from "mongoose";
import Attendance from "../models/attendance.model";
import User from "../models/user.model";
import { AttendanceStatus } from "../interfaces/attendance.interface";

interface CreateAttendanceInput {
    memberId: string;
    checkIn?: string;
    status?: AttendanceStatus;
    notes?: string;
}

interface UpdateAttendanceInput {
    checkOut?: string;
    status?: AttendanceStatus;
    notes?: string;
}

const getDayRange = (date: Date) => {
    const start = new Date(date);
    start.setUTCHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);

    return { start, end };
};

const validateDate = (value: string): Date => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        throw new Error("Invalid date");
    }

    return date;
};

const validateStatus = (status: string): AttendanceStatus => {
    if (status !== "PRESENT" && status !== "LATE") {
        throw new Error("Invalid attendance status");
    }

    return status;
};

const populateAttendance = (query: any) => {
    return query.populate("member", "name email phone");
};

export const createAttendance = async (data: CreateAttendanceInput) => {
    if (!data.memberId || !mongoose.Types.ObjectId.isValid(data.memberId)) {
        throw new Error("Invalid Member ID");
    }

    const member = await User.findOne({
        _id: data.memberId,
        role: "MEMBER",
        isActive: true
    });

    if (!member) {
        throw new Error("Active member not found");
    }

    const checkIn = data.checkIn
        ? validateDate(data.checkIn)
        : new Date();

    const { start, end } = getDayRange(checkIn);

    const existingAttendance = await Attendance.findOne({
        member: member._id,
        attendanceDate: {
            $gte: start,
            $lt: end
        }
    });

    if (existingAttendance) {
        throw new Error("Attendance already recorded for this member today");
    }

    const status = data.status
        ? validateStatus(data.status)
        : "PRESENT";

    const notes = data.notes?.trim();

    if (data.notes !== undefined && typeof data.notes !== "string") {
        throw new Error("Notes must be a valid string");
    }

    const attendance = await Attendance.create({
        member: member._id,
        attendanceDate: start,
        checkIn,
        status,
        notes
    });

    return populateAttendance(
        Attendance.findById(attendance._id)
    );
};

export const getAllAttendance = async () => {
    return populateAttendance(
        Attendance.find().sort({ attendanceDate: -1, checkIn: -1 })
    );
};

export const getAttendanceById = async (id: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid ID");
    }

    const attendance = await populateAttendance(
        Attendance.findById(id)
    );

    if (!attendance) {
        throw new Error("Attendance record not found");
    }

    return attendance;
};

export const updateAttendance = async (
    id: string,
    data: UpdateAttendanceInput
) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid ID");
    }

    const allowedFields = ["checkOut", "status", "notes"];
    const providedFields = Object.keys(data);

    if (providedFields.length === 0) {
        throw new Error("At least one field is required");
    }

    const invalidFields = providedFields.filter(
        field => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
        throw new Error("Invalid update fields");
    }

    const attendance = await Attendance.findById(id);

    if (!attendance) {
        throw new Error("Attendance record not found");
    }

    if (data.checkOut !== undefined) {
        const checkOut = validateDate(data.checkOut);

        if (checkOut <= attendance.checkIn) {
            throw new Error("Check-out must be after check-in");
        }

        attendance.checkOut = checkOut;
    }

    if (data.status !== undefined) {
        attendance.status = validateStatus(data.status);
    }

    if (data.notes !== undefined) {
        if (typeof data.notes !== "string") {
            throw new Error("Notes must be a valid string");
        }

        attendance.notes = data.notes.trim();
    }

    await attendance.save();

    return populateAttendance(
        Attendance.findById(attendance._id)
    );
};

export const deleteAttendance = async (id: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid ID");
    }

    const attendance = await Attendance.findByIdAndDelete(id);

    if (!attendance) {
        throw new Error("Attendance record not found");
    }

    return attendance;
};
