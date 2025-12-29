// backend/src/config/dotEnv.js

import dotenv from 'dotenv';

/**
 * NOTES:
 * 1. the loading of the .env file within the backend directory (i.e., backend/.env) is a no-op in the container instances.
 * 2. for container instances, refer to the .env.docker.development & .env.docker.production files. These files are loaded prior to running "npm run dev".
 */

dotenv.config({ quiet: true });
