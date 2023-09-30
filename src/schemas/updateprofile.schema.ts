import { string, minLength, maxLength, regex, object } from 'valibot';

export const UpdateProfileSchema = object({
  newUsername: string([
    minLength(3, "Se requieren almenos 3 caracteres para el nombre de usuario."),
    maxLength(12, "El nombre de usuario es demasiado largo."),
    regex(/^[A-Z0-9]+$/i, "El nombre de usuario solo puede tener letras y números."),
  ]),
  newProfile: string(),
});