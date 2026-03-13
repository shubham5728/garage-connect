import { z } from "zod";

// Example base validation schemas to be expanded later
export const paginationSchema = z.object({
  page: z.string().optional().transform(Number),
  limit: z.string().optional().transform(Number),
});
