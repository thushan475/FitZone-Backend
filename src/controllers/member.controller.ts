import { RequestHandler } from "express";
import {
    createMember,
    getAllMembers,
    getMemberById,
    updateMember,
    deleteMember,
    activateMember
} from "../services/member.service";

const create: RequestHandler = (req, res) => {
    createMember(req.body)
        .then((member) => {
            res.status(201).json({
                success: true,
                message: "Member created successfully",
                data: member
            });
        })
        .catch((error) => {
            res.status(400).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Member creation failed"
            });
        });
};

const getAll: RequestHandler = (req, res) => {
    const status = typeof req.query.status === "string"
        ? req.query.status.toUpperCase()
        : "ALL";

    if (!["ACTIVE", "INACTIVE", "ALL"].includes(status)) {
        res.status(400).json({
            success: false,
            message: "Invalid member status"
        });
        return;
    }

    getAllMembers(status as "ACTIVE" | "INACTIVE" | "ALL")
        .then((members) => {
            res.status(200).json({
                success: true,
                message: "Members retrieved successfully",
                data: members
            });
        })
        .catch(() => {
            res.status(500).json({
                success: false,
                message: "Failed to retrieve members"
            });
        });
};

const getById: RequestHandler = (req, res) => {
    const memberId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

    getMemberById(memberId)
        .then((member) => {
            res.status(200).json({
                success: true,
                message: "Member retrieved successfully",
                data: member
            });
        })
        .catch((error) => {
            res.status(404).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Member not found"
            });
        });
};

const update: RequestHandler = (req, res) => {
    const memberId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

    updateMember(memberId, req.body)
        .then((member) => {
            res.status(200).json({
                success: true,
                message: "Member updated successfully",
                data: member
            });
        })
        .catch((error) => {
            res.status(400).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Failed to update member"
            });
        });
};

const remove: RequestHandler = (req, res) => {
    const memberId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

    deleteMember(memberId)
        .then((member) => {
            res.status(200).json({
                success: true,
                message: "Member deactivated successfully",
                data: member
            });
        })
        .catch((error) => {
            res.status(400).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Failed to deactivate member"
            });
        });
};

const activate: RequestHandler = (req, res) => {
    const memberId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

    activateMember(memberId)
        .then((member) => {
            res.status(200).json({
                success: true,
                message: "Member activated successfully",
                data: member
            });
        })
        .catch((error) => {
            res.status(400).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Failed to activate member"
            });
        });
};

export { create, getAll, getById, update, remove, activate };