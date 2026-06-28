// src/types/socket.io.d.ts

import { UserDocument } from '#models/User.js';

// https://www.typescriptlang.org/docs/handbook/declaration-merging.html
// declare module 'socket.io' merges into Socket.IO's existing
// Socket interface rather than replacing it.
// This is TypeScript's module augmentation pattern.
// After this, anywhere you have a socket: Socket, TypeScript knows:
//  1. .user is a UserDocument
//  2. .userId is a string
// This matches exactly what socket.auth.middleware.js:39-40 assigns and what socket.ts:37-40 reads from.
// One thing to be aware of: .d.ts files are declaration-only.
// This file has no runtime presence — it purely teaches TypeScript about the shape.
// The actual assignment still happens in socketAuthMiddleware at runtime.
declare module 'socket.io' {
  interface Socket {
    user: UserDocument;
    userId: string;
  }
}
