import { Router } from "express";
import { deleteUser } from '../controllers/db.controller';

const router = Router();

router.get('/:id', deleteUser);

export default router;