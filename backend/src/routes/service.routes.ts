import { Router } from "express";
import { createService, updateService, deleteService } from "../controllers/service.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validateRequest } from "../middleware/validate.js";
import { createServiceSchema, updateServiceSchema } from "../validators/service.validator.js";

const router = Router();

// Only GARAGE_OWNER can manage services
router.use(authenticate, authorize(["GARAGE_OWNER"]));

router.post("/", validateRequest(createServiceSchema), createService);
router.put("/:id", validateRequest(updateServiceSchema), updateService);
router.delete("/:id", deleteService);

export default router;
