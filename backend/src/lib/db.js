// backend/src/lib/db.js

import mongoose from 'mongoose';
import { parentLogger } from '#config/logger.js';

const log = parentLogger.child({ module: 'db.js' });
const { USE_LOCAL_DB, MONGO_DB_LOCAL_URI, MONGO_DB_URI } = process.env;

export const connectDB = async () => {
  try {
    const mongoURI =
      USE_LOCAL_DB === 'true'
        ? MONGO_DB_LOCAL_URI // Local MongoDB Container (development)
        : MONGO_DB_URI; // Cloud MongoDB (production)

    if (!mongoURI) {
      throw new Error('"mongoURI" is not defined. Check your MONGO_DB_LOCAL_URI or MONGO_DB_URI.');
    }

    const conn = await mongoose.connect(mongoURI);
    // Must use string interpolation for dbLogger.info() i.e., not dbLogger.info("text: ", string);
    log.info(`Connected to MongoDB successfully: ${conn.connection.host}`);
  } catch (error) {
    log.error(error, 'Error connecting to MongoDB.');
    process.exit(1); // 1 status code means fail, 0 means success
  }
};
