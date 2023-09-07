import { string, object, minLength, endsWith, email, type Output } from "valibot";

export const RegisterSchema = object({
  email: string([
    minLength(1, "Se requiere almenos 1 caracter."),
    endsWith(
      "@gmail.com" || "@hotmail.com",
      "Dominio de correo electrónico inválido."
    ),
    email("Ingrese un email válido."),
  ]),
  gender: string(),
  password: string([
    minLength(7, "Se requieren almenos 7 caracteres para la contraseña."),
  ]),
  password2: string([
    minLength(7, "Se requieren almenos 7 caracteres para la constraseña."),
  ]),
  username: string([
    minLength(3, "Se requieren almenos 3 caracteres para el nombre de usuario."),
  ]),
});

export type RegisterData = Output<typeof RegisterSchema>;