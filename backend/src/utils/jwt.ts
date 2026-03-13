import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_dev";

export interface JwtPayload {
  sub: string;
  role: string;
}

export const generateToken = (userId: string, role: string): string => {
  return jwt.sign({ sub: userId, role } as JwtPayload, JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};
