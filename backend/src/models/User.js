// backend/src/models/User.js

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
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

export const User = mongoose.model('User', userSchema);
