
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

interface AttendanceFilter {
    memberId?: string;
    from?: string;
    to?: string;
    status?: AttendanceStatus;
}

const getDayRange = (date: Date) => {
    const start = new Date(date);
    start.setUTCHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);

    return { start, end };
};

const validateDate = (value: string): Date => {
    if (typeof value !== "string" || !value.trim()) {
        throw new Error("Valid date is required");
    }

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
    if (!data || typeof data !== "object") {
        throw new Error("Attendance data is required");
    }

    if (
        typeof data.memberId !== "string" ||
        !mongoose.Types.ObjectId.isValid(data.memberId)
    ) {
        throw new Error("Invalid Member ID");
    }

    if (
        data.notes !== undefined &&
        typeof data.notes !== "string"
    ) {
        throw new Error("Notes must be a valid string");
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

    const status = data.status
        ? validateStatus(data.status)
        : "PRESENT";

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

    const attendance = await Attendance.create({
        member: member._id,
        attendanceDate: start,
        checkIn,
        status,
        notes: data.notes?.trim()
    });

    return populateAttendance(
        Attendance.findById(attendance._id)
    );
};

export const getAllAttendance = async (filters: AttendanceFilter = {}) => {
    const query: Record<string, any> = {};

    if (filters.memberId) {
        if (!mongoose.Types.ObjectId.isValid(filters.memberId)) {
            throw new Error("Invalid Member ID");
        }

        query.member = filters.memberId;
    }

    if (filters.status) {
        query.status = validateStatus(filters.status);
    }

    if (filters.from || filters.to) {
        query.attendanceDate = {};

        if (filters.from) {
            query.attendanceDate.$gte = getDayRange(
                validateDate(filters.from)
            ).start;
        }

        if (filters.to) {
            const toDate = getDayRange(validateDate(filters.to));
            query.attendanceDate.$lt = toDate.end;
        }

        if (
            filters.from &&
            filters.to &&
            new Date(filters.from) > new Date(filters.to)
        ) {
            throw new Error("From date cannot be after to date");
        }
    }

    return populateAttendance(
        Attendance.find(query).sort({
            attendanceDate: -1,
            checkIn: -1
        })
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

    if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new Error("Attendance update data is required");
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

    if (
        data.notes !== undefined &&
        typeof data.notes !== "string"
    ) {
        throw new Error("Notes must be a valid string");
    }

    const attendance = await Attendance.findById(id);

    if (!attendance) {
        throw new Error("Attendance record not found");
    }

    if (data.checkOut !== undefined) {
        if (attendance.checkOut) {
            throw new Error("Attendance already checked out");
        }

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
