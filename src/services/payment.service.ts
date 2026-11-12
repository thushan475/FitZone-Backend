
import mongoose from "mongoose";
import Payment from "../models/payment.model";
import User from "../models/user.model";
import Subscription from "../models/subscription.model";
import { IPayment } from "../interfaces/payment.interface";

export const createPayment = async (data: Partial<IPayment>) => {
    if (!data.member || !mongoose.Types.ObjectId.isValid(data.member.toString())) {
        throw new Error("Invalid member ID");
    }

    if (!data.subscription || !mongoose.Types.ObjectId.isValid(data.subscription.toString())) {
        throw new Error("Invalid subscription ID");
    }

    if (typeof data.amount !== "number" || !Number.isFinite(data.amount) || data.amount <= 0) {
        throw new Error("Amount must be a valid positive number");
    }

    if (!["CASH", "CARD", "BANK_TRANSFER"].includes(data.paymentMethod || "")) {
        throw new Error("Invalid payment method");
    }

    if (data.paymentStatus && !["PAID", "PENDING", "FAILED"].includes(data.paymentStatus)) {
        throw new Error("Invalid payment status");
    }

    const member = await User.findOne({
        _id: data.member,
        role: "MEMBER",
        isActive: true
    });

    if (!member) {
        throw new Error("Active member not found");
    }

    const subscription = await Subscription.findById(data.subscription);

    if (!subscription) {
        throw new Error("Subscription not found");
    }

    if (subscription.member.toString() !== data.member.toString()) {
        throw new Error("Subscription does not belong to this member");
    }

    if (data.referenceNumber) {
        const existingPayment = await Payment.findOne({
            referenceNumber: data.referenceNumber.trim()
        });

        if (existingPayment) {
            throw new Error("Reference number already exists");
        }
    }

    const payment = await Payment.create({
        ...data,
        referenceNumber: data.referenceNumber?.trim() || undefined,
        notes: data.notes?.trim() || undefined
    });

    if (payment.paymentStatus === "PAID") {
        subscription.amountPaid += payment.amount;
        await subscription.save();
    }

    return payment;
};

export const getAllPayments = async () => {
    return Payment.find()
        .populate("member", "name email phone")
        .populate("subscription", "planName planPrice status")
        .sort({ createdAt: -1 });
};

export const getPaymentById = async (id: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid ID");
    }

    const payment = await Payment.findById(id)
        .populate("member", "name email phone")
        .populate("subscription", "planName planPrice status");

    if (!payment) {
        throw new Error("Payment not found");
    }

    return payment;
};

export const updatePayment = async (id: string, data: Partial<IPayment>) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid ID");
    }

    const allowedFields = [
        "amount",
        "paymentMethod",
        "paymentStatus",
        "paymentDate",
        "referenceNumber",
        "notes"
    ];

    const invalidFields = Object.keys(data).filter(
        field => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
        throw new Error(`Invalid fields: ${invalidFields.join(", ")}`);
    }

    if (Object.keys(data).length === 0) {
        throw new Error("At least one field is required");
    }

    if (data.amount !== undefined &&
        (typeof data.amount !== "number" || !Number.isFinite(data.amount) || data.amount <= 0)) {
        throw new Error("Amount must be a valid positive number");
    }

    if (data.paymentMethod !== undefined &&
        !["CASH", "CARD", "BANK_TRANSFER"].includes(data.paymentMethod)) {
        throw new Error("Invalid payment method");
    }

    if (data.paymentStatus !== undefined &&
        !["PAID", "PENDING", "FAILED"].includes(data.paymentStatus)) {
        throw new Error("Invalid payment status");
    }

    if (data.paymentDate !== undefined &&
        (Number.isNaN(new Date(data.paymentDate).getTime()))) {
        throw new Error("Invalid payment date");
    }

    if (data.referenceNumber !== undefined) {
        data.referenceNumber = data.referenceNumber.trim();

        if (data.referenceNumber) {
            const existingPayment = await Payment.findOne({
                referenceNumber: data.referenceNumber,
                _id: { $ne: id }
            });

            if (existingPayment) {
                throw new Error("Reference number already exists");
            }
        } else {
            data.referenceNumber = undefined;
        }
    }

    if (data.notes !== undefined) {
        data.notes = data.notes.trim();
    }

    const payment = await Payment.findById(id);

    if (!payment) {
        throw new Error("Payment not found");
    }

    const previousStatus = payment.paymentStatus;
    const previousAmount = payment.amount;

    Object.assign(payment, data);

    await payment.save();

    const subscription = await Subscription.findById(payment.subscription);

    if (subscription) {
        const previousPaidAmount = previousStatus === "PAID" ? previousAmount : 0;
        const currentPaidAmount = payment.paymentStatus === "PAID" ? payment.amount : 0;

        subscription.amountPaid = Math.max(
            0,
            subscription.amountPaid - previousPaidAmount + currentPaidAmount
        );

        await subscription.save();
    }

    return payment;
};

export const deletePayment = async (id: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid ID");
    }

    const payment = await Payment.findById(id);

    if (!payment) {
        throw new Error("Payment not found");
    }

    if (payment.paymentStatus === "PAID") {
        const subscription = await Subscription.findById(payment.subscription);

        if (subscription) {
            subscription.amountPaid = Math.max(
                0,
                subscription.amountPaid - payment.amount
            );

            await subscription.save();
        }
    }

    await Payment.findByIdAndDelete(id);

    return payment;
};
