import { z } from "zod";

export const registerCustomerSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.literal("CUSTOMER"),
  vehicle: z
    .object({
      make: z.string().min(1, "Vehicle make is required"),
      model: z.string().min(1, "Vehicle model is required"),
      year: z.number().int().optional(),
      vehicleNumber: z.string().min(1, "Vehicle number is required"),
      vehicleType: z.enum(["TWO_WHEELER", "FOUR_WHEELER"]),
    })
    .optional(),
});

export type RegisterCustomerInput = z.infer<typeof registerCustomerSchema>;

export const registerOwnerSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.literal("GARAGE_OWNER"),
  garage: z.object({
    garageName: z.string().min(2, "Garage name is required"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    contactNo: z.string().optional(),
    description: z.string().optional(),
  }),
});

export type RegisterOwnerInput = z.infer<typeof registerOwnerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
