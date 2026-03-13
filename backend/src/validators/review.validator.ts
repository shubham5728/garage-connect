import { z } from "zod";

export const submitReviewSchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID"),
  rating: z.number().int("Rating must be an integer").min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  comment: z.string().optional()
});

export type SubmitReviewInput = z.infer<typeof submitReviewSchema>;
