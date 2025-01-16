import jwt, { JwtPayload as BaseJwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET!;

export interface JwtPayload extends BaseJwtPayload {
  _id: string;
  role: string;
  email: string; // Add any other fields as needed
}


export const generateToken = (
  payload: any | JwtPayload,
  expiresIn: string = "24h"
): Promise<string> => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, SECRET_KEY, { expiresIn }, (error, token) => {
      if (error) {
        reject(error)
      } else resolve(token as string)
    })
  })
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, SECRET_KEY) as JwtPayload;
};
