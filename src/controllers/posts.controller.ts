import { Request, Response } from "express";
import UserModel from "../models/user.model";
import { format } from "date-fns";
import { Post } from "../../types";

export async function createPost(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { title, body } = req.body;

    const userFound = await UserModel.findOne({ _id: id });

    if (!userFound) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get all users from DB
    const usersDB = await UserModel.find({});

    const postsOrdered = usersDB
    .map((user) => user.posts)
    .flat()
    .sort((a, b) => Number(b.postId) - Number(a.postId));

    const lastPostId = postsOrdered[0] ?? '0';

    const post = {
      author: userFound.username,
      body,
      date: format(new Date(), 'dd-MM-yyyy'),
      photoUrl: userFound.photoUrl,
      postId: (Number(lastPostId) + 1).toString(),
      reactions: {
        thumbsUp: {
          count: 0,
          reactedBy: [],
        },
        thumbsDown: {
          count: 0,
          reactedBy: [],
        },
        smile: {
          count: 0,
          reactedBy: [],
        },
        hooray: {
          count: 0,
          reactedBy: [],
        },
        unhappy: {
          count: 0,
          reactedBy: [],
        },
        heart: {
          count: 0,
          reactedBy: [],
        },
      },
      title,
    };

    const doc = await UserModel.findById(id)

    const posts: Post[] = doc!.posts;
    
    const newPosts: Post[] = [...posts, post];

    await UserModel.findByIdAndUpdate(id, { posts: newPosts });
    
    res.sendStatus(200);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Error al crear post" });
    }
  }
}

export async function updatePost(req: Request, res: Response) {
  try {
    
  } catch (error) {
    
  }
}

export async function deletePost(req: Request, res: Response) {
  try {
    
  } catch (error) {
    
  }
}

export async function updateReactions(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { newReactions, postId } = req.body;
    const userFound = await UserModel.findOne({ _id: id });
    if (!userFound) {
      return res.status(404).json({ message: "User not found" });
    }
    const postsDB: Post[] | [] = userFound.posts;
    if (postsDB.length > 0) {
      const newPosts = postsDB.map((post: Post) => {
        if (post.postId === postId) {
          return {
            ...post,
            reactions: newReactions,
          }
        } else {
          return post;
        }
      });
      await UserModel.findByIdAndUpdate(id, { posts: newPosts });
      res.json({ newReactions });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Error al crear post" });
    }
  }
}
