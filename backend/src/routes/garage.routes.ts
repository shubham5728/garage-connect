import { Router } from "express";
import { searchGarages, getGarageDetails } from "../controllers/garage.controller.js";
import { getGarageServices } from "../controllers/service.controller.js";
import { validateRequest } from "../middleware/validate.js";
import { searchGaragesSchema } from "../validators/garage.validator.js";

const router = Router();

// Public garage routes
router.get("/", validateRequest(searchGaragesSchema), searchGarages);
router.get("/:id", getGarageDetails);
router.get("/:id/services", getGarageServices);

export default router;
