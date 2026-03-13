import { Request, Response } from "express";
import prisma from "../config/prisma.js";
import { VerifyGarageInput } from "../validators/admin.validator.js";

// Helper to recalculate garage rating (copied from review controller for consistency)
const updateGarageRating = async (garageId: string) => {
  const agg = await prisma.review.aggregate({
    _avg: { rating: true },
    where: { garageId }
  });
  
  const newRating = agg._avg.rating ? parseFloat(agg._avg.rating.toFixed(2)) : 0.0;
  
  await prisma.garage.update({
    where: { id: garageId },
    data: { rating: newRating }
  });
};

export const getAllGarages = async (req: Request, res: Response): Promise<void> => {
  try {
    const garages = await prisma.garage.findMany({
      include: {
        user: { select: { fullName: true, email: true } },
        _count: { select: { services: true, bookings: true, reviews: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    res.status(200).json({ success: true, count: garages.length, garages });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch garages" });
  }
};

export const verifyGarage = async (req: Request, res: Response): Promise<void> => {
  try {
    const garageId = req.params.id as string;
    const { isVerified } = req.body as VerifyGarageInput;

    const existingGarage = await prisma.garage.findUnique({ where: { id: garageId } });
    if (!existingGarage) {
      res.status(404).json({ success: false, message: "Garage not found" });
      return;
    }

    const updatedGarage = await prisma.garage.update({
      where: { id: garageId },
      data: { isVerified }
    });

    res.status(200).json({ success: true, garage: updatedGarage });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to verify garage" });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
        customer: { select: { id: true, _count: { select: { bookings: true } } } },
        garages: { select: { id: true, garageName: true, isVerified: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    res.status(200).json({ success: true, count: users.length, users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch users" });
  }
};

export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const reviewId = req.params.id as string;

    const existingReview = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!existingReview) {
      res.status(404).json({ success: false, message: "Review not found" });
      return;
    }

    await prisma.review.delete({ where: { id: reviewId } });

    // Recalculate garage rating after deletion
    await updateGarageRating(existingReview.garageId);

    res.status(200).json({ success: true, message: "Review deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to delete review" });
  }
};
