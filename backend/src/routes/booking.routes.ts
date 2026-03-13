import { Router } from "express";
import { 
  createBooking, 
  getCustomerBookings, 
  getGarageBookings, 
  getBookingDetails, 
  updateBookingStatus 
} from "../controllers/booking.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validateRequest } from "../middleware/validate.js";
import { createBookingSchema, updateBookingStatusSchema } from "../validators/booking.validator.js";

const router = Router();

// All booking routes require authentication
router.use(authenticate);

// Customer routes
router.post("/", authorize(["CUSTOMER"]), validateRequest(createBookingSchema), createBooking);
router.get("/my", authorize(["CUSTOMER"]), getCustomerBookings);

// Garage owner routes
router.get("/garage", authorize(["GARAGE_OWNER"]), getGarageBookings);
router.patch("/:id/status", authorize(["GARAGE_OWNER"]), validateRequest(updateBookingStatusSchema), updateBookingStatus);

// Shared route (accessible by CUSTOMER, GARAGE_OWNER, ADMIN if they have access to the specific booking)
router.get("/:id", authorize(["CUSTOMER", "GARAGE_OWNER", "ADMIN"]), getBookingDetails);

export default router;
