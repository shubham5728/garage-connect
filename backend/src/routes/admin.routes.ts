import { Router } from "express";
import { 
  getAllGarages, 
  verifyGarage, 
  getAllUsers, 
  deleteReview 
} from "../controllers/admin.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validateRequest } from "../middleware/validate.js";
import { verifyGarageSchema } from "../validators/admin.validator.js";

const router = Router();

// All routes require ADMIN role and valid JWT
router.use(authenticate, authorize(["ADMIN"]));

router.get("/garages", getAllGarages);
router.patch("/garages/:id/verify", validateRequest(verifyGarageSchema), verifyGarage);

router.get("/users", getAllUsers);

router.delete("/reviews/:id", deleteReview);

export default router;
