// backend/src/models/User.ts

import mongoose from 'mongoose';

// Our User Domain Type.
// To be imported in socket.io.d.ts and express.d.ts to describe the user attached to req.user and socket.user
export interface IUser {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  profilePic: string;
  enableSound: boolean;
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
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
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
  },
  { timestamps: true } // createdAt (member since...) + updatedAt (last login...)
);

export const User = mongoose.model<IUser>('User', userSchema);
