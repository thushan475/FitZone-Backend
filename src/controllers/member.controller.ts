
import { RequestHandler } from "express";
import { createMember, getAllMembers, getMemberById, updateMember, deleteMember } from "../services/member.service";
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
            const message = error instanceof Error
                ? error.message
                : "Member creation failed";

            res.status(400).json({
                success: false,
                message
            });
        });
};

const getAll: RequestHandler = (_req, res) => {
    getAllMembers()
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
            const message = error instanceof Error
                ? error.message
                : "Failed to retrieve member";

            res.status(404).json({
                success: false,
                message
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
            const message = error instanceof Error
                ? error.message
                : "Failed to update member";

            res.status(400).json({
                success: false,
                message
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
            const message = error instanceof Error
                ? error.message
                : "Failed to deactivate member";

            res.status(400).json({
                success: false,
                message
            });
        });
};

export { create, getAll, getById, update, remove };