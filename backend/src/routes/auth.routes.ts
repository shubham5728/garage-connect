import { Router } from "express";
import { registerCustomer, registerOwner, login, getMe } from "../controllers/auth.controller.js";
import { validateRequest } from "../middleware/validate.js";
import { registerCustomerSchema, registerOwnerSchema, loginSchema } from "../validators/auth.validator.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.post("/register/customer", validateRequest(registerCustomerSchema), registerCustomer);
router.post("/register/owner", validateRequest(registerOwnerSchema), registerOwner);
router.post("/login", validateRequest(loginSchema), login);
router.get("/me", authenticate, getMe);

export default router;
