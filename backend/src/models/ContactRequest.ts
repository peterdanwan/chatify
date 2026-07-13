// backend/src/models/ContactRequest.ts

import mongoose, { Types } from 'mongoose';

export interface IContactRequest {
  requester: Types.ObjectId;
  recipient: Types.ObjectId;
  status: 'pending' | 'accepted';
}

export type ContactRequestDocument = mongoose.HydratedDocument<IContactRequest>;

const contactRequestSchema = new mongoose.Schema<IContactRequest>(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted'], default: 'pending' },
  },
  { timestamps: true }
);

// One request per direction between a given pair — sendContactRequest checks the reverse
// direction itself (and auto-accepts on a mutual request) rather than relying on this index for that.
contactRequestSchema.index({ requester: 1, recipient: 1 }, { unique: true });
// Speeds up "my incoming pending requests" and "my accepted contacts" lookups
contactRequestSchema.index({ recipient: 1, status: 1 });
contactRequestSchema.index({ requester: 1, status: 1 });

export const ContactRequest = mongoose.model<IContactRequest>(
  'ContactRequest',
  contactRequestSchema
);
