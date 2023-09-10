import { Request, Response } from "express";
import { Resend } from "resend";
import { createAccessToken } from "../libs/jwt";
import UserModel from "../models/user.model";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import "dotenv/config";

const resend = new Resend("re_S4bFDWfw_8uWrxExsZVtyP9JPFjy5r83H");

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

    const html = `<div>
      <p>¡Hola!</p>
      <p>Para verificar tu cuenta, haz click en el siguiente enlace:</p>
      <p>${URL}/api/user/verifyaccount/${newUser.id}</p>
      <p>Si no fuiste tu quien registró esta cuenta, ignora este correo electrónico.</p>
    </div>`;

    await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: [newUser.email],
      subject: "Verificación de cuenta",
      html: html,
    });

    res.sendStatus(200);
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

    const accessToken = await createAccessToken({
      userId: userFound?.id,
      username: userFound?.username,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: process.env.NODE_ENV !== "development",
      secure: true,
      // sameSite: "lax",
    });

    res.json(userFound);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

export function logout(_req: Request, res: Response) {
  res.cookie('accessToken', '', {
    expires: new Date(0),
  });
  return res.sendStatus(200);
}

export async function verifyToken(req: Request, res: Response) {
  const { accessToken } = req.cookies;

  const secret: string = process.env.ACCESS_TOKEN_SECRET as string;

  if (!accessToken) return res.send({ message: 'No token found' });

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
    
    return res.json({
      userId: userFound.id,
      email: userFound.email,
      username: userFound.username,
    });
  });
}