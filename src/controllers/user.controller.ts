import { Request, Response } from "express";
import UserModel from "../models/user.model";
import { Post } from "../../types";
import nodemailer from "nodemailer";

const URL = process.env.NODE_ENV === "production"
? "https://blogposts.up.railway.app"
: "http://localhost:3000";

export async function updateProfileImage(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { newPhotoUrl } = req.body;
    const userFound = await UserModel.findOne({ _id: id });
    if (!userFound) {
      res.sendStatus(404).json({ message: "User not found." });
    }
    await UserModel.findByIdAndUpdate(id, { photoUrl: newPhotoUrl });
    const posts: Post[] | [] = userFound!.posts;
    let data = {};
    if (posts.length > 0) {
      const newPosts: Post[] = posts.map((post: Post) => {
        return {
          ...post,
          photoUrl: newPhotoUrl,
        }
      });
      await UserModel.findByIdAndUpdate(id, { posts: newPosts });
      data = {
        newPhotoUrl,
        newPosts,
      }
    } else {
      data = {
        newPhotoUrl,
      }
    }
    res.json(data);
  } catch (error) {
    if (error instanceof Error) {
      res.sendStatus(500).json({ message: "Error al actualizar imagen de perfil." });
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
    await UserModel.findByIdAndUpdate(id, { isVerified: true });
    res.sendStatus(200);
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

    const response = `<div style="font-size: 2rem; display: flex; flex-direction: column; row-gap: 20px; width: fit-content; margin: auto;">
      <p>¡ Su cuenta ha sido activada !</p>
      <p>Ya puedes cerrar esta página.</p>
    </div>`

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
        return res.status(400);
      } else {
        return res.send(response);
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Un error ha ocurrido." });
    }
  }
}