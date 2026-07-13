// backend/src/models/User.ts

import mongoose from 'mongoose';

// Our User Domain Type.
// To be imported in socket.io.d.ts and express.d.ts to describe the user attached to req.user and socket.user
export interface IUser {
  email: string;
  displayName: string;
  // Unique handle used for adding/finding people. Optional at the schema level because
  // a freshly-created OAuth account has none yet — see requireUsername middleware, which
  // gates chat features until the user claims one.
  username?: string;
  password?: string; // optional: OAuth users don't have passwords
  profilePic: string;
  enableSound: boolean;
  googleId?: string;
  facebookId?: string;
  githubId?: string;
}

// Full Mongoose Document shape: IUser fields + Mongoose-managed fields (_id, createdAt, updatedAt, methods)
// This is what is returned via findById(), findOne(), etc.
// Wraps the IUser with _id, and document methods like .save()
// This type will be used in protectRoute middleware for req.user
export type UserDocument = mongoose.HydratedDocument<IUser>;

const userSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true, // lets multiple users have no username yet (pending OAuth claim)
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minLength: 6,
    },
    profilePic: {
      type: String,
      default: '',
    },
    enableSound: {
      type: Boolean,
      default: true,
    },
    googleId: { type: String },
    facebookId: { type: String },
    githubId: { type: String },
  },
  { timestamps: true } // createdAt (member since...) + updatedAt (last login...)
);

export const User = mongoose.model<IUser>('User', userSchema);
