import { z, ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";

export const validateRequest = (schema: ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const dataToValidate = req.method === "GET" ? req.query : req.body;
    const result = schema.safeParse(dataToValidate);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: result.error.issues.map((e: any) => ({
          path: e.path.join("."),
          message: e.message,
        })),
      });
      return;
    }
    
    if (req.method === "GET") {
      Object.assign(req.query, result.data);
    } else {
      req.body = result.data;
    }
    next();
  };
};
