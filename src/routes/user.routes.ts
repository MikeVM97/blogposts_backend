import { Router } from "express";
import { updateProfileImage, verifyAccount, resendEmail } from "../controllers/user.controller";

const router = Router();

router.post('/updateprofileimage/:id', updateProfileImage);
router.get('/verifyaccount/:id', verifyAccount);
router.post('/resendemail/:id', resendEmail);

export default router;