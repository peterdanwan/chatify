// src/types/express.d.ts

import type { UserDocument } from '#models/User.js';

// Augment passport's Express.User so req.user is typed as UserDocument everywhere.
// protectRoute guarantees req.user is always set on protected routes — use req.user! there.
declare global {
  namespace Express {
    interface User extends UserDocument {}
  }
}

export {};
