// backend/src/models/Message.js

import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    // The ID of the user who sent this message
    // References the User model via ObjectId
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // The ID of the user who sent this message
    // References the User model via ObjectId
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true } // createdAt (member since...) + updatedAt (last login...)
);

export const Message = mongoose.model('Message', messageSchema);
