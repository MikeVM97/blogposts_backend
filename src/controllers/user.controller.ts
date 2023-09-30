import { Request, Response } from "express";
import UserModel from "../models/user.model";
import { Post, Reactions } from "../../types";
import nodemailer from "nodemailer";

const URL = process.env.NODE_ENV === "production"
? "https://blogposts.up.railway.app"
: "http://localhost:3000";

export async function updateProfile(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { newUsername, newProfile, oldUsername } = req.body;

    const userFound = await UserModel.findOne({ _id: id });
    if (!userFound) {
      return res.status(404).json({ message: ["User not found"] });
    }

    let flag = false;
    const usersDB = await UserModel.find({});
    if (!usersDB) {
      return res.json({ message: ['No se puede acceder a la base de datos'] });
    }
    usersDB.forEach((user) => {
      if (flag) return;
      if (id === user.id) {
        return;
      }
      if (newUsername === user.username) {
        flag = true;
      }
    });
    if (flag) {
      return res.status(400).json({ message: ["Nombre de usuario en uso"] });
    }

    if (newProfile !== userFound.photoUrl) {
      await UserModel.findByIdAndUpdate(id, { photoUrl: newProfile });
      const posts: Post[] | [] = userFound!.posts;
      if (posts.length > 0) {
        const newPosts: Post[] = posts.map((post: Post) => {
          return {
            ...post,
            photoUrl: newProfile,
          }
        });
        await UserModel.findByIdAndUpdate(id, { posts: newPosts });
      }
    }

    await UserModel.findByIdAndUpdate(id, { username: newUsername });

    /* const posts: Post[] | [] = userFound!.posts;
    if (posts.length > 0) {
      const newPosts: Post[] = posts.map((post: Post) => {
        return {
          ...post,
          author: newUsername,
        }
      });
      await UserModel.findByIdAndUpdate(id, { posts: newPosts });
    } */

    usersDB.forEach(async (user) => {
      let newPosts: Post[] = user.posts;
      user.posts.length > 0 && user.posts.forEach((post: Post) => {
        let currentPost = post;
        for (const key in post.reactions) {
          if (post.reactions[key as keyof Reactions].reactedBy.some((n) => n === oldUsername)) {
            const newReactedBy = post.reactions[key as keyof Reactions].reactedBy.map((name: string) => {
              if (name === oldUsername) return newUsername;
              return name;
            });
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
        }
        if (user.id === id) {
          currentPost = {
            ...currentPost,
            author: newUsername,
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

    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: ["Error al actualizar imagen de perfil"] });
    }
  }
}

export async function verifyAccount(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const userFound = await UserModel.findOne({ _id: id });

    if (!userFound) {
      res.status(404).json({ message: 'User not found.' });
    }

    const response = `<div style="font-size: 2rem; display: flex; flex-direction: column; row-gap: 20px; width: fit-content; margin: auto;">
      <p>¡ Su cuenta ha sido activada !</p>
      <p>Ya puedes cerrar esta página.</p>
    </div>`

    await UserModel.findByIdAndUpdate(id, { isVerified: true });

    res.send(response);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Un error ha ocurrido." });
    }
  }
}

export async function resendEmail(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { email, username } = req.body;
    const mail = `<div>
      <p>¡Hola ${username}!</p>
      <p>Para verificar tu cuenta, haz click en el siguiente enlace:</p>
      <p>${URL}/api/user/verifyaccount/${id}</p>
      <p>Si no fuiste tu quien registró esta cuenta, ignora este correo electrónico.</p>
    </div>`;

    const mailTransporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      auth: {
        user: 'vivancomayta@gmail.com',
        pass: 'lurlwpeuhwnqomdw'
      }
    });

    mailTransporter.sendMail({
      from: 'vivancomayta@gmail.com',
      to: email,
      subject: 'Verificación de cuenta',
      html: mail,
    }, (err, data) => {
      if(err) {
        console.log(err);
        return res.status(400).json({ message: 'Error al envíar email de verificación' });
      } else {
        return res.sendStatus(200);
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Un error ha ocurrido." });
    }
  }
}

export async function updateReactions(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { newUsername, oldUsername } = req.body;

    const userFound = await UserModel.findOne({ _id: id });
    if (!userFound) {
      return res.status(404).json({ message: ["User not found"] });
    }

    const usersDB = await UserModel.find({});

    if (!usersDB) {
      return res.json({ message: ['No se puede acceder a la base de datos'] });
    }

    usersDB.forEach(async (user) => {
      let newPosts: Post[] = user.posts;
      user.posts.forEach((post: Post) => {
        let currentPost = post;
        for (const key in post.reactions) {
          if (post.reactions[key as keyof Reactions].reactedBy.some((n) => n === oldUsername)) {
            const newReactedBy = post.reactions[key as keyof Reactions].reactedBy.map((name: string) => {
              if (name === oldUsername) return newUsername;
              return name;
            });
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

    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof Error) {
      res.sendStatus(500).json({ message: ["Error al actualizar imagen de perfil"] });
    }
  }
}