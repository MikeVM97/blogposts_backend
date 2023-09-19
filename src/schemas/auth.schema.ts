import { string, object, minLength, maxLength, regex, email, type Output } from "valibot";

export const RegisterSchema = object({
  email: string([
    minLength(1, "Se requiere almenos 1 caracter."),
    email("Ingrese un email válido."),
  ]),
  gender: string(),
  password: string([
    minLength(7, "Se requieren almenos 7 caracteres para la contraseña."),
    maxLength(16, "La contraseña es demasiado larga."),
    regex(/^[A-Z0-9]+$/i, "La contraseña solo puede tener letras y números."),
  ]),
  password2: string([
    minLength(7, "Se requieren almenos 7 caracteres para la constraseña."),
    maxLength(16, "La contraseña es demasiado larga."),
    regex(/^[A-Z0-9]+$/i, "La contraseña solo puede tener letras y números."),
  ]),
  username: string([
    minLength(3, "Se requieren almenos 3 caracteres para el nombre de usuario."),
    maxLength(12, "El nombre de usuario es demasiado largo."),
    regex(/^[A-Z0-9]+$/i, "El nombre de usuario solo puede tener letras y números."),
  ]),
});

export type RegisterData = Output<typeof RegisterSchema>;