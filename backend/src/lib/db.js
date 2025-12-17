// backend/src/lib/db.js

import mongoose from 'mongoose';
import { parentLogger } from '#config/logger.js';

const log = parentLogger.child({ module: 'db.js' });

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_DB_URI);
    // Must you string interpolation for dbLogger.info() i.e., not dbLogger.info("text: ", string);
    log.info(`Connected to MongoDB successfully: ${conn.connection.host}`);
  } catch (error) {
    log.error(error, 'Error connecting to MongoDB.');
    process.exit(1); // 1 status code means fail, 0 means success
  }
};
