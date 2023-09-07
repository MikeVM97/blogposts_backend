import { Router } from "express";
import { register, login, logout, verifyToken } from "../controllers/auth.controller";
import { validateSchema } from "../middlewares/validator.middleware";
import { RegisterSchema } from "../schemas/auth.schema";

const router = Router();

router.post('/register', validateSchema(RegisterSchema), register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/verify', verifyToken);

export default router;