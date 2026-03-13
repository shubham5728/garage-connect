import { z } from "zod";

export const addVehicleSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  vehicleNumber: z.string().min(1, "Vehicle number is required"),
  vehicleType: z.enum(["TWO_WHEELER", "FOUR_WHEELER"]),
});

export type AddVehicleInput = z.infer<typeof addVehicleSchema>;
