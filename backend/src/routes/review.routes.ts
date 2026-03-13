import { Router } from "express";
import { submitReview, getGarageReviews } from "../controllers/review.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validateRequest } from "../middleware/validate.js";
import { submitReviewSchema } from "../validators/review.validator.js";

const router = Router();

// Publicly read reviews for a garage
// Note: This matches the GET /api/garages/:id/reviews pattern if we mount it under /api/garages/:id/reviews
// Alternatively, if mounted at /api/reviews/garages/:id
router.get("/garage/:id", getGarageReviews);

// Protected customer route
router.post("/", authenticate, authorize(["CUSTOMER"]), validateRequest(submitReviewSchema), submitReview);

export default router;
