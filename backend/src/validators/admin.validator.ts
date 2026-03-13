import { z } from "zod";

export const verifyGarageSchema = z.object({
  isVerified: z.boolean()
});

export type VerifyGarageInput = z.infer<typeof verifyGarageSchema>;
