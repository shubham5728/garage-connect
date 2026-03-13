import { z } from "zod";

export const createBookingSchema = z.object({
  garageId: z.string().uuid("Invalid garage ID"),
  vehicleId: z.string().uuid("Invalid vehicle ID"),
  serviceIds: z.array(z.string().uuid()).nonempty("Select at least one service"),
  scheduledDate: z.string().datetime({ message: "Invalid scheduledDate ISO string" }),
  customerIssue: z.string().optional(),
  notes: z.string().optional(),
  pickupRequired: z.boolean().default(false),
  pickupAddress: z.string().optional()
}).refine(data => !(data.pickupRequired && !data.pickupAddress), {
  message: "pickupAddress is required if pickupRequired is true",
  path: ["pickupAddress"]
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(["APPROVED", "DECLINED", "IN_PROGRESS", "COMPLETED"])
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
