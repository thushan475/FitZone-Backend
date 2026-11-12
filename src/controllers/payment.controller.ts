
import { RequestHandler } from "express";
import {
    createPayment,
    getAllPayments,
    getPaymentById,
    updatePayment,
    deletePayment
} from "../services/payment.service";

export const createPaymentController = ((req, res) => {
    createPayment(req.body)
        .then(payment => {
            res.status(201).json({
                success: true,
                message: "Payment created successfully",
                data: payment
            });
        })
        .catch(error => {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : "Failed to create payment"
            });
        });
}) as RequestHandler;

export const getAllPaymentsController = ((_req, res) => {
    getAllPayments()
        .then(payments => {
            res.status(200).json({
                success: true,
                message: "Payments retrieved successfully",
                data: payments
            });
        })
        .catch(error => {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Failed to retrieve payments"
            });
        });
}) as RequestHandler;

export const getPaymentByIdController = ((req, res) => {
    const id = String(req.params.id);

    getPaymentById(id)
        .then(payment => {
            res.status(200).json({
                success: true,
                message: "Payment retrieved successfully",
                data: payment
            });
        })
        .catch(error => {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : "Failed to retrieve payment"
            });
        });
}) as RequestHandler;

export const updatePaymentController = ((req, res) => {
    const id = String(req.params.id);

    updatePayment(id, req.body)
        .then(payment => {
            res.status(200).json({
                success: true,
                message: "Payment updated successfully",
                data: payment
            });
        })
        .catch(error => {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : "Failed to update payment"
            });
        });
}) as RequestHandler;

export const deletePaymentController = ((req, res) => {
    const id = String(req.params.id);

    deletePayment(id)
        .then(payment => {
            res.status(200).json({
                success: true,
                message: "Payment deleted successfully",
                data: payment
            });
        })
        .catch(error => {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : "Failed to delete payment"
            });
        });
}) as RequestHandler;
