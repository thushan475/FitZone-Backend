
import { RequestHandler } from "express";
import {
    createAttendance,
    getAllAttendance,
    getAttendanceById,
    updateAttendance,
    deleteAttendance
} from "../services/attendance.service";

const getId = (value: string | string[] | undefined): string => {
    return Array.isArray(value) ? value[0] : value || "";
};

const getErrorMessage = (error: unknown): string => {
    return error instanceof Error
        ? error.message
        : "Internal server error";
};

const getStatusCode = (message: string): number => {
    return message.includes("not found") ? 404 : 400;
};

export const create = ((req, res) => {
    createAttendance(req.body)
        .then(data => {
            res.status(201).json({
                success: true,
                message: "Attendance recorded successfully",
                data
            });
        })
        .catch(error => {
            const message = getErrorMessage(error);

            res.status(getStatusCode(message)).json({
                success: false,
                message
            });
        });
}) as RequestHandler;

export const getAll = ((req, res) => {
    getAllAttendance()
        .then(data => {
            res.status(200).json({
                success: true,
                message: "Attendance records retrieved successfully",
                data
            });
        })
        .catch(error => {
            res.status(500).json({
                success: false,
                message: getErrorMessage(error)
            });
        });
}) as RequestHandler;

export const getById = ((req, res) => {
    getAttendanceById(getId(req.params.id))
        .then(data => {
            res.status(200).json({
                success: true,
                message: "Attendance record retrieved successfully",
                data
            });
        })
        .catch(error => {
            const message = getErrorMessage(error);

            res.status(getStatusCode(message)).json({
                success: false,
                message
            });
        });
}) as RequestHandler;

export const update = ((req, res) => {
    updateAttendance(getId(req.params.id), req.body)
        .then(data => {
            res.status(200).json({
                success: true,
                message: "Attendance updated successfully",
                data
            });
        })
        .catch(error => {
            const message = getErrorMessage(error);

            res.status(getStatusCode(message)).json({
                success: false,
                message
            });
        });
}) as RequestHandler;

export const remove = ((req, res) => {
    deleteAttendance(getId(req.params.id))
        .then(data => {
            res.status(200).json({
                success: true,
                message: "Attendance deleted successfully",
                data
            });
        })
        .catch(error => {
            const message = getErrorMessage(error);

            res.status(getStatusCode(message)).json({
                success: false,
                message
            });
        });
}) as RequestHandler;
