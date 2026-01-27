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
    // Message allows for both text and/or image to be sent
    text: {
      type: String,
      trim: true,
      maxLength: 2000,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true } // createdAt (member since...) + updatedAt (last login...)
);

// Optimize frequent queries
// messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1});
// messageSchema.index({ receiverId: 1, senderId: 1, createdAt: -1});

// Require at least one of text or image
// messageSchema.pre("validate", function (next) {
//  if (!this.text && !this.image) {
//    return next(new Error("Either text or image is required"));
//  }
// });

export const Message = mongoose.model('Message', messageSchema);
