import { z } from "zod";

export const searchGaragesSchema = z.object({
  vehicleType: z.enum(["TWO_WHEELER", "FOUR_WHEELER"]).optional(),
  service: z.string().optional(),
  minRating: z.string().optional().transform(Number),
  lat: z.string().optional().transform(Number),
  lng: z.string().optional().transform(Number),
  radiusKm: z.string().optional().transform(Number),
  isVerified: z.enum(["true", "false"]).optional().transform((val) => val === "true"),
});

export type SearchGaragesQuery = z.infer<typeof searchGaragesSchema>;
