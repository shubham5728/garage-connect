import { Router } from "express";
import { getProfile, updateCustomerProfile, updateGarageProfile, addVehicle } from "../controllers/user.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validateRequest } from "../middleware/validate.js";
import { updateCustomerProfileSchema, updateGarageProfileSchema } from "../validators/user.validator.js";
import { addVehicleSchema } from "../validators/vehicle.validator.js";

const router = Router();

router.use(authenticate);

router.get("/me", getProfile);

router.post(
  "/vehicles",
  authorize(["CUSTOMER"]),
  validateRequest(addVehicleSchema),
  addVehicle
);

router.put(
  "/profile/customer",
  authorize(["CUSTOMER"]),
  validateRequest(updateCustomerProfileSchema),
  updateCustomerProfile
);

router.put(
  "/profile/garage",
  authorize(["GARAGE_OWNER"]),
  validateRequest(updateGarageProfileSchema),
  updateGarageProfile
);

export default router;
