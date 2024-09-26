import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET!;

export const generateToken = (
  payload: any,
  expiresIn: string = "1h"
): Promise<string> => {
  // return jwt.sign(payload, SECRET_KEY, { expiresIn });
  return new Promise((resolve, reject) => {
    jwt.sign(payload, SECRET_KEY, { expiresIn }, (error, token) => {
      if (error) {
        reject(error)
      } else resolve(token as string)
    })
  })
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, SECRET_KEY);
};
