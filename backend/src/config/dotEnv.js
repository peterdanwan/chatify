// backend/src/config/dotEnv.js

import dotenv from 'dotenv';

/**
 * NOTES:
 * 1. The loading of the .env file within the backend directory (i.e., backend/.env) is a no-op in container instances.
 * 2. For container instances, refer to the .env.docker.development & .env.docker.production files.
 * 3. This module uses console.log/warn/error instead of Pino because it must run BEFORE the logger is initialized.
 *
 * Environment Files Strategy:
 * 1. backend/.env: Used when running on base machine (npm run dev)
 *   - MONGO_DB_LOCAL_URI uses 'localhost' as host
 * 2. .env.docker.development: Used with the docker-compose. Docker Compose for development
 *   - MONGO_DB_LOCAL_URI uses service name (e.g., 'chatify-mongodb') as host
 * 3. .env.docker.production: Used for production deployments
 *   - MONGO_DB_URI points to MongoDB Atlas
 */

dotenv.config({ quiet: true });

// Define your environment variables with descriptions
const ENV_VARS = {
  // ============================================
  // Core Application Settings
  // ============================================
  NODE_ENV: {
    required: true,
    description: 'Application environment',
    values: ['development', 'production', 'test'],
  },
  PORT: {
    required: false,
    description: 'Server port (defaults to 5001)',
    default: 5001,
    validate: (value) => {
      const port = parseInt(value, 10);
      return (
        (!isNaN(port) && port > 0 && port < 65536) ||
        'PORT must be a valid number between 1 and 65535'
      );
    },
  },
  LOG_LEVEL: {
    required: false,
    description: 'Pino logging level - sets minimum log level to display',
    values: ['trace', 'debug', 'info', 'warn', 'error', 'fatal'],
    default: 'info',
  },

  // ============================================
  // Database Configuration
  // ============================================
  USE_LOCAL_DB: {
    required: true,
    description:
      'Use local MongoDB container (true) or MongoDB Atlas cloud (false). ' +
      'Set to true for development, false for production.',
    values: ['true', 'false'],
  },

  // MongoDB Atlas (Production) - Required when USE_LOCAL_DB=false
  MONGO_DB_USERNAME: {
    required: (env) => env.USE_LOCAL_DB !== 'true',
    description: 'MongoDB Atlas username (required for production)',
    example: 'your-atlas-username',
  },
  MONGO_DB_PASSWORD: {
    required: (env) => env.USE_LOCAL_DB !== 'true',
    description: 'MongoDB Atlas password (required for production)',
    example: 'your-atlas-password',
  },
  MONGO_DB_URI: {
    required: (env) => env.USE_LOCAL_DB !== 'true',
    description: 'MongoDB Atlas connection string (required for production)',
    example:
      'mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority',
    validate: (value) =>
      value.startsWith('mongodb://') ||
      value.startsWith('mongodb+srv://') ||
      'MONGO_DB_URI must be a valid MongoDB connection string',
  },

  // Local MongoDB (Development) - Required when USE_LOCAL_DB=true
  MONGO_INITDB_ROOT_USERNAME: {
    required: (env) => env.USE_LOCAL_DB === 'true',
    description: 'Root username for local MongoDB containers (development)',
    example: 'admin',
  },
  MONGO_INITDB_ROOT_PASSWORD: {
    required: (env) => env.USE_LOCAL_DB === 'true',
    description: 'Root password for local MongoDB containers (development)',
    example: 'password123',
  },
  MONGO_INITDB_DATABASE: {
    required: (env) => env.USE_LOCAL_DB === 'true',
    description: 'Initial database name for local MongoDB containers (development)',
    example: 'chatify',
  },
  MONGO_DB_LOCAL_URI: {
    required: (env) => env.USE_LOCAL_DB === 'true',
    description:
      'MongoDB connection string for local development. ' +
      'Host should be "localhost" when running on base machine, or service name when running in Docker Compose.',
    example:
      'mongodb://admin:password@localhost:27017/chatify?authSource=admin (base machine) OR ' +
      'mongodb://admin:password@chatify-mongodb:27017/chatify?authSource=admin (Docker Compose)',
    validate: (value) =>
      value.startsWith('mongodb://') ||
      'MONGO_DB_LOCAL_URI must be a valid MongoDB connection string',
  },

  // ============================================
  // Authentication & Security
  // ============================================
  JWT_SECRET: {
    required: true,
    description: 'Secret key for JWT token signing (use a long, random string)',
    validate: (value) =>
      value.length >= 32 || 'JWT_SECRET should be at least 32 characters for security',
  },

  // ============================================
  // Email Configuration (Resend)
  // ============================================
  RESEND_API_KEY: {
    required: (env) => env.NODE_ENV === 'production',
    description: 'Resend API key for sending transactional emails (required in production)',
    example: 're_xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  },
  EMAIL_FROM: {
    required: (env) => env.NODE_ENV === 'production',
    description: 'Email address to send emails from (must be verified in Resend)',
    example: 'noreply@yourdomain.com',
    validate: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value) || 'EMAIL_FROM must be a valid email address';
    },
  },
  EMAIL_FROM_FIRST_NAME: {
    required: false,
    description: 'First name displayed in email sender field',
    default: 'Chatify',
  },
  EMAIL_FROM_LAST_NAME: {
    required: false,
    description: 'Last name displayed in email sender field',
    default: 'Team',
  },

  // ============================================
  // Frontend Configuration
  // ============================================
  CLIENT_URL: {
    required: (env) => env.NODE_ENV === 'production',
    description: 'Frontend application URL (used in emails and CORS configuration)',
    example: 'https://yourdomain.com',
    validate: (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return 'CLIENT_URL must be a valid URL';
      }
    },
  },
};

function validateEnv() {
  const errors = [];
  const warnings = [];
  const env = process.env;

  for (const [key, config] of Object.entries(ENV_VARS)) {
    const value = env[key];
    const isRequired =
      typeof config.required === 'function' ? config.required(env) : config.required;

    // Check if required variable is missing
    if (isRequired && !value) {
      errors.push({
        variable: key,
        issue: 'Missing required environment variable',
        description: config.description,
        example: config.example,
      });
      continue;
    }

    // Apply default if missing and not required
    if (!value && config.default !== undefined) {
      process.env[key] = String(config.default);
      warnings.push(`${key}: Using default value "${config.default}"`);
      continue;
    }

    // Skip further validation if value is empty and not required
    if (!value) {
      continue;
    }

    // Validate allowed values
    if (config.values && !config.values.includes(value)) {
      errors.push({
        variable: key,
        issue: `Invalid value "${value}"`,
        description: config.description,
        allowedValues: config.values,
      });
    }

    // Custom validation
    if (config.validate) {
      const validationResult = config.validate(value);
      if (validationResult !== true) {
        errors.push({
          variable: key,
          issue: validationResult,
          description: config.description,
        });
      }
    }
  }

  // Report errors
  // Note: Using console.error because Pino logger isn't initialized yet
  if (errors.length > 0) {
    console.error('\n❌ Environment Configuration Errors:\n');
    console.error('═══════════════════════════════════════════════════════════════\n');
    errors.forEach((error, index) => {
      console.error(`${index + 1}. ${error.variable}`);
      console.error(`   Issue: ${error.issue}`);
      console.error(`   Description: ${error.description}`);
      if (error.example) console.error(`   Example: ${error.example}`);
      if (error.allowedValues)
        console.error(`   Allowed values: ${error.allowedValues.join(', ')}`);
      console.error('');
    });
    console.error('═══════════════════════════════════════════════════════════════\n');

    throw new Error(
      `Environment validation failed with ${errors.length} error(s). Please check your .env file.`
    );
  }

  // Report warnings
  // Note: Using console.warn because Pino logger isn't initialized yet
  if (warnings.length > 0) {
    console.warn('\n⚠️  Environment Configuration Warnings:\n');
    warnings.forEach((warning) => console.warn(`   ${warning}`));
    console.warn('');
  }

  // Success message with environment summary
  // Note: Using console.log because Pino logger isn't initialized yet
  const isLocal = env.USE_LOCAL_DB === 'true';
  const dbType = isLocal ? 'Local MongoDB Container' : 'MongoDB Atlas';

  console.log('✅ Environment configuration validated successfully');
  console.log(`   Environment: ${env.NODE_ENV}`);
  console.log(`   Database: ${dbType}`);
  console.log(`   Port: ${env.PORT}`);
  console.log(`   Log Level: ${env.LOG_LEVEL}\n`);
}

// Run validation immediately
validateEnv();
