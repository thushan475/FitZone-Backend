import { RequestHandler } from "express";
import {
    createAttendance,
    getAllAttendance,
    getAttendanceById,
    updateAttendance,
    deleteAttendance
} from "../services/attendance.service";
import { AttendanceStatus } from "../interfaces/attendance.interface";

const getId = (value: string | string[] | undefined): string => {
    return Array.isArray(value) ? value[0] : value || "";
};

const getErrorMessage = (error: unknown): string => {
    return error instanceof Error
        ? error.message
        : "Internal server error";
};

const getStatusCode = (message: string): number => {
    if (message.includes("not found")) return 404;
    if (message.includes("Internal server error")) return 500;
    return 400;
};

export const create: RequestHandler = async (req, res) => {
    try {
        const data = await createAttendance(req.body);

        res.status(201).json({
            success: true,
            message: "Attendance recorded successfully",
            data
        });
    } catch (error) {
        const message = getErrorMessage(error);
        res.status(getStatusCode(message)).json({ success: false, message });
    }
};

export const getAll: RequestHandler = async (req, res) => {
    try {
        const data = await getAllAttendance({
            memberId: req.query.memberId as string | undefined,
            from: req.query.from as string | undefined,
            to: req.query.to as string | undefined,
            status: req.query.status as AttendanceStatus | undefined
        });

        res.status(200).json({
            success: true,
            message: "Attendance records retrieved successfully",
            data
        });
    } catch (error) {
        const message = getErrorMessage(error);
        res.status(getStatusCode(message)).json({ success: false, message });
    }
};

export const getById: RequestHandler = async (req, res) => {
    try {
        const data = await getAttendanceById(getId(req.params.id));

        res.status(200).json({
            success: true,
            message: "Attendance record retrieved successfully",
            data
        });
    } catch (error) {
        const message = getErrorMessage(error);
        res.status(getStatusCode(message)).json({ success: false, message });
    }
};

export const update: RequestHandler = async (req, res) => {
    try {
        const data = await updateAttendance(getId(req.params.id), req.body);

        res.status(200).json({
            success: true,
            message: "Attendance updated successfully",
            data
        });
    } catch (error) {
        const message = getErrorMessage(error);
        res.status(getStatusCode(message)).json({ success: false, message });
    }
};

export const remove: RequestHandler = async (req, res) => {
    try {
        const data = await deleteAttendance(getId(req.params.id));

        res.status(200).json({
            success: true,
            message: "Attendance deleted successfully",
            data
        });
    } catch (error) {
        const message = getErrorMessage(error);
        res.status(getStatusCode(message)).json({ success: false, message });
    }
};