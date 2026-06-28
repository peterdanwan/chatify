// backend/src/models/Message.ts

import mongoose from 'mongoose';
import { Types } from 'mongoose';

export interface IMessage {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  text?: string;
  image?: string;
}

export type MessageDocument = mongoose.HydratedDocument<IMessage>;

const messageSchema = new mongoose.Schema<IMessage>(
  {
    // The ID of the user who sent this message
    // References the User model via ObjectId
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // The ID of the user who received this message
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

export const Message = mongoose.model<IMessage>('Message', messageSchema);
