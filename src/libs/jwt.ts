import jwt from "jsonwebtoken";
import "dotenv/config";

const accessToken: string = process.env.ACCESS_TOKEN_SECRET as string;

const refreshToken: string = process.env.REFRESH_TOKEN_SECRET as string;

export function createAccessToken(payload: object) {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, accessToken, { expiresIn: '1d' }, (err: unknown, token: unknown) => {
      if (err) reject(err);
      resolve(token);
    });
  });
}

export function createRefreshToken(payload: object) {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, refreshToken, { expiresIn: '1d' }, (err: unknown, token: unknown) => {
      if (err) reject(err);
      resolve(token);
    });
  });
}