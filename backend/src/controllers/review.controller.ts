import { Request, Response } from "express";
import prisma from "../config/prisma.js";
import { SubmitReviewInput } from "../validators/review.validator.js";

// Helper to recalculate garage rating
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

export const submitReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.sub as string;
    const { bookingId, rating, comment } = req.body as SubmitReviewInput;

    const customer = await prisma.customer.findUnique({ where: { userId } });
    if (!customer) {
      res.status(403).json({ success: false, message: "Only customers can submit reviews" });
      return;
    }

    // Ensure booking exists, belongs to customer, is completed, and hasn't been reviewed yet
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { review: true }
    });

    if (!booking) {
      res.status(404).json({ success: false, message: "Booking not found" });
      return;
    }

    if (booking.customerId !== customer.id) {
      res.status(403).json({ success: false, message: "You can only review your own bookings" });
      return;
    }

    if (booking.status !== "COMPLETED") {
      res.status(400).json({ success: false, message: "You can only review completed bookings" });
      return;
    }

    if (booking.review) {
      res.status(400).json({ success: false, message: "A review already exists for this booking" });
      return;
    }

    const review = await prisma.review.create({
      data: {
        bookingId: booking.id,
        customerId: customer.id,
        garageId: booking.garageId,
        rating,
        comment: comment || null
      }
    });

    // Recalculate garage rating
    await updateGarageRating(booking.garageId);

    res.status(201).json({ success: true, review });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to submit review" });
  }
};

export const getGarageReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const garageId = req.params.id as string;
    
    // Check if garage exists
    const garageExists = await prisma.garage.findUnique({ where: { id: garageId } });
    if (!garageExists) {
      res.status(404).json({ success: false, message: "Garage not found" });
      return;
    }

    const reviews = await prisma.review.findMany({
      where: { garageId },
      include: {
        customer: { include: { user: { select: { fullName: true } } } },
        booking: { include: { vehicle: { select: { make: true, model: true } } } }
      },
      orderBy: { createdAt: "desc" }
    });

    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch reviews" });
  }
};
