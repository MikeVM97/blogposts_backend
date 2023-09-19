import { NextFunction, Request, Response } from "express";
import { createAccessToken } from "../libs/jwt";
import UserModel from "../models/user.model";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import "dotenv/config";

const URL = process.env.NODE_ENV === "production"
? "https://blogposts.up.railway.app"
: "http://localhost:3000";

export async function register(req: Request, res: Response) {
  try {
    const { email, gender, password, password2, username } = req.body;

    const emailExists = await UserModel.findOne({ email });
    const usernameExists = await UserModel.findOne({ username });

    if (emailExists) {
      return res.status(400).json({
        message: ["Correo electrónico en uso."],
      });
    }

    if (password !== password2) {
      return res.status(400).json({
        message: ["Las contraseñas no coinciden."],
      });
    }

    if (usernameExists) {
      return res.status(400).json({
        message: ["Nombre de usuario en uso."],
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      email,
      gender,
      isVerified: false,
      logged: false,
      password: passwordHash,
      photoUrl: "blank",
      posts: [],
      username,
    });
    
    await newUser.save();

    const mail = `<div>
      <p>¡Hola ${newUser.username}!</p>
      <p>Para verificar tu cuenta, haz click en el siguiente enlace:</p>
      <p>${URL}/api/user/verifyaccount/${newUser.id}</p>
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
        pass: 'lurlwpeuhwnqomdw',
      },
    });

    mailTransporter.sendMail({
      from: 'vivancomayta@gmail.com',
      to: newUser.email,
      subject: 'Verificación de cuenta',
      html: mail,
    }, (err, data) => {
      if(err) {
        console.log(err);
        return res.status(400).json({ message: 'Error al envíar correo de verificación' });
      } else {
        return res.send(response);
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const userFound = await UserModel.findOne({ email });
        
    if (!userFound) {
      return res.status(400).json({
        message: ["Email no registrado, intente con otro."],
      });
    }

    const isMatch = await bcrypt.compare(password, userFound.password);

    if (!isMatch) {
      return res.status(400).json({
        message: ["Contraseña incorrecta."],
      });
    }

    if (!userFound.isVerified) {
      return res.status(400).json({ not_verified: ["Es necesario verificar su cuenta para poder ingresar."], id: userFound.id, username: userFound.username });
    }

    const accessToken = await createAccessToken({
      userId: userFound?.id,
      username: userFound?.username,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: process.env.NODE_ENV !== "development",
      secure: true,
      sameSite: "none",
    });

    res.json(userFound);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

export function logout(req: Request, res: Response) {
  res.clearCookie("accessToken", {
    httpOnly: process.env.NODE_ENV !== "development",
    secure: true,
    sameSite: "none",
  });
  res.sendStatus(200);
}

export async function verifyToken(req: Request, res: Response, next: NextFunction) {
  const { accessToken } = req.cookies;

  const secret: string = process.env.ACCESS_TOKEN_SECRET as string;

  if (!accessToken) return res.send({ message: 'Sin token de acceso, usuario no autenticado.' });

  jwt.verify(accessToken, secret, async (error: unknown, user: any) => {
    /* user = {
      "userId": "64d52746c0544001c962bae4",
      "username": "Mike",
      "iat": 1693768508,
      "exp": 1693772108
    } */

    if (error) return res.sendStatus(401);
    
    const userFound = await UserModel.findById(user.userId);

    if (!userFound) return res.sendStatus(401);
    
    /* res.json({
      userId: userFound.id,
      email: userFound.email,
      username: userFound.username,
    }); */

    next();
  });
}

