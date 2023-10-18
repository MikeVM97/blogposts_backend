import { Request, Response, NextFunction } from "express";
import { createAccessToken } from "../libs/jwt";
import UserModel from "../models/user.model";
import jwt, { JsonWebTokenError, VerifyErrors, VerifyOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import "dotenv/config";

interface JWTError {
  name: string;
  message: string;
  expireAt: string;
}

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
        return res.sendStatus(200);
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
      email: userFound.email,
      gender: userFound.gender,
      id: userFound.id,
      isVerified: userFound.isVerified,
      photoUrl: userFound.photoUrl,
      posts: userFound.posts,
      username: userFound.username,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: process.env.NODE_ENV !== "development",
      secure: true,
      sameSite: "none",
    });

    return res.json(userFound);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const { accessToken } = req.cookies;
    if (!accessToken) return res.status(401).json({ message: 'Sin token de acceso' });
    const secret: string = process.env.ACCESS_TOKEN_SECRET as string;
    jwt.verify(accessToken, secret, async (error: unknown, user: any) => {
      /* user = {
        "userId": "64d52746c0544001c962bae4",
        "username": "Mike",
        "iat": 1693768508,
        "exp": 1693772108
      } */
      if (error) return res.status(401).json({ message: 'El token de acceso ha expirado' });
      const userFound = await UserModel.findById(user.userId);
      if (!userFound) return res.status(401).json({  message: 'User not found' });
      /* res.json({
        userId: userFound.id,
        email: userFound.email,
        username: userFound.username,
      }); */
    });
    res.clearCookie("accessToken", {
      httpOnly: process.env.NODE_ENV !== "development",
      secure: true,
      sameSite: "none",
    });
    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error });
    }
  }
}

export async function verifyToken(req: Request, res: Response) {
  const { accessToken } = req.cookies;

  const secret: string = process.env.ACCESS_TOKEN_SECRET as string;

  if (!accessToken) return res.status(401).json({ message: 'Sin token de acceso' });

  jwt.verify(accessToken, secret, async (error: unknown, user: any) => {
    /* user = {
      "userId": "64d52746c0544001c962bae4",
      "username": "Mike",
      "iat": 1693768508,
      "exp": 1693772108
    } */
    if (error) return res.status(401).json({ message: 'El token de acceso ha expirado' });
    const userFound = await UserModel.findById(user.id);
    if (!userFound) return res.status(401).json({  message: 'User not found' });
    /* res.json({
      userId: userFound.id,
      email: userFound.email,
      username: userFound.username,
    }); */
    return res.status(200).json(userFound);
  });
}

