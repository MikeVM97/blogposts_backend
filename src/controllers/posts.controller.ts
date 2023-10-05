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

    const lastPostId = postsOrdered[0].postId ?? '0';

    const d = format(new Date(), 'dd-MM-yyyy');

    const post = {
      body,
      date: `comentado en ${parseDate(d)}`,
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

    const doc = await UserModel.findById(id);

    const posts: Post[] | [] = doc!.posts;
    
    const newPosts: Post[] = [...posts, post];

    await UserModel.findByIdAndUpdate(id, { posts: newPosts });
    
    res.status(200).json({ newPosts });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Error al crear post" });
    }
  }
}

export async function updatePost(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { title, body, postId } = req.body;

    const userFound = await UserModel.findOne({ _id: id });
    if (!userFound) {
      return res.status(404).json({ message: ["User not found"] });
    }

    const d = format(new Date(), 'dd-MM-yyyy');

    const usersDB = await UserModel.find({});

    const postsOrdered = usersDB
    .map((user) => user.posts)
    .flat()
    .sort((a, b) => Number(b.postId) - Number(a.postId));

    const lastPostId = postsOrdered[0].postId ?? '0';

    const posts = userFound.posts;
    const newPosts = posts.map((post: Post) => {
      if (post.postId === postId) {
        return {
          ...post,
          title,
          body,
          date: `editado en ${parseDate(d)}`,
          postId: (Number(lastPostId) + 1).toString(),
        }
      } else {
        return post;
      }
    });

    await UserModel.findByIdAndUpdate(id, { posts: newPosts });
    
    return res.status(200).json({ newPosts });
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      return res.status(500).json({ message: ["Un error ha ocurrido"] });
    }
  }
}

export async function deletePost(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { postId } = req.body;
    const userFound = await UserModel.findOne({ _id: id });
    if (!userFound) {
      return res.status(404).json({ message: ["User not found"] });
    }

    const posts = userFound.posts;
    const newPosts = posts.filter((post) => post.postId !== postId);

    await UserModel.findByIdAndUpdate(id, { posts: newPosts });

    return res.status(200).json({ newPosts });
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      return res.status(500).json({ message: ["Un error ha ocurrido"] });
    }
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
      return res.status(500).json({ message: "Error al crear post" });
    }
  }
}

function parseDate(date: string) {
  // date: "18-08-2023"
  const months: string[] = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const day: string = date.slice(0, 2); // "18"
  let month: string = date.slice(3, 5); // "08"
  const year: string = date.slice(6); // "2023"

  const index: number = parseInt(month) - 1;

  month = months[index]; // Agosto

  return `${day} ${month}, ${year}`; // "18 Agosto, 2023"
}