import { Schema, model } from "mongoose";
import { User } from "../../types";

const userSchema = new Schema<User>({
  email: { type: String, required: true },
  gender: { type: String, required: true },
  isVerified: { type: Boolean, required: true},
  logged: { type: Boolean, required: true },
  password: { type: String, required: true },
  photoUrl: { type: String, required: true },
  posts: { type: [Object], required: true },
  username: { type: String, required: true },
});

userSchema.set('toJSON', {
  transform: (_document, objReturned) => {
    objReturned.id = objReturned._id;
    delete objReturned._id;
    delete objReturned.__v;
  }
});

const UserModel = model<User>('auths', userSchema);

export default UserModel;

// model recibe 2 parámetros
// el 1° es el nombre de la colección existente, o en caso de no encontrarse se creará uno nuevo
// Casos particular:
// MongoDB Atlas: base de datos = users
// la base de datos "users" tiene una colección llamada "auth"
// Al intentar acceder a esa colección con: model<User>('auth', userSchema)
// el algoritmo no lo encontrará y creará una nueva colección con el nombre "auths" (EN PLURAL) dentro
// de la base de datos "users", teniendo así, 2 colecciones ("auth" y "auths") dentro de "users"
// Esto puede generar conflictos, por tanto, es un DETALLE MUY IMPORTANTE A TENER EN CUENTA.
// Por regla general, siempre nombrar las colecciones en plural (terminando en "s").