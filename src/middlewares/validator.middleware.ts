import { NextFunction, Request, Response } from "express";
import { ValiError } from "valibot";

export const validateSchema = (schema: any) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ValiError) {
      return res
      .status(400)
      .json({ message: error.issues.map((error) => error.message) });
    } else {
      return res.status(400).json({ message: ["Un error inesperado ha ocurrido."] });
    }
  }
};