import { Router } from "express";
import { updateProfile, verifyAccount, resendEmail } from "../controllers/user.controller";
import { validateSchema } from "../middlewares/validator.middleware";
import { UpdateProfileSchema } from "../schemas/updateprofile.schema";

const router = Router();

router.post('/updateprofile/:id', validateSchema(UpdateProfileSchema), updateProfile);
router.get('/verifyaccount/:id', verifyAccount);
router.post('/resendemail/:id', resendEmail);

export default router;