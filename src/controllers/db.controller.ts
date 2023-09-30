import { Request, Response } from "express";
import UserModel from "../models/user.model";
import { Post, Reactions } from "../../types";

export async function deleteUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const userFound = await UserModel.findOne({ _id: id });

    if (!userFound) {
      return res.json({ message: 'No se encontró al usuario a eliminar' });
    }

    // DO: ELIMINAR AL USUARIO DE LA BASE DE DATOS
    const userDeleted = await UserModel.deleteOne({ _id: userFound.id });

    if (!userDeleted) {
      return res.json({ message: 'No se pudo eliminar al usuario' });
    }

    // DO: ELIMINAR TODO RASTRO DEL USUARIO, EN LOS POSTS, COMENTARIOS, ETC.
    const usersDB = await UserModel.find({});

    if (!usersDB) {
      return res.json({ message: 'No se puede acceder a la base de datos' });
    }

    usersDB.forEach(async (user) => {
      if (user.username === userFound.username) return;
      let newPosts: Post[] = user.posts;
      user.posts.forEach((post: Post) => {
        let currentPost = post;
        for (const key in post.reactions) {
          const newReactedBy = post.reactions[key as keyof Reactions].reactedBy.filter((n) => n !== userFound.username);
          currentPost = {
            ...currentPost,
            reactions: {
              ...currentPost.reactions,
              [key]: {
                count: newReactedBy.length,
                reactedBy: newReactedBy,
              }
            }
          }
        }
        newPosts = newPosts.map((n: Post) => {
          if (n === post) {
            return currentPost;
          } else {
            return n;
          }
        });
      });
      await UserModel.findByIdAndUpdate(user.id, { posts: newPosts });
    });

    return res.json({ deleted: 'Usuario eliminado: ' + userFound.username });
  } catch (err) {
    if (err instanceof Error) {
      return res.status(500).json({ error: 'Ha ocurrido un error al eliminar el usuario' });
    }
  }
}