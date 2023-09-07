import { Router } from "express";
import { createPost, updatePost, deletePost, updateReactions } from "../controllers/posts.controller";

const router = Router();

router.post('/createpost/:id', createPost);
router.put('/updatepost/:id', updatePost);
router.delete('/deletepost/:id', deletePost);

router.post('/updatereactions/:id', updateReactions);

export default router;