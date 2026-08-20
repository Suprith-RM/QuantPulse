require('dotenv').config();
/**
 * Configuration Module
 *
 * WHY CENTRALIZE CONFIG:
 * If you read process.env.DATABASE_URL in 10 different files, and you forget
 * to set it, you get a cryptic runtime error deep in the app. By validating
 * all required environment variables HERE, at startup, the app refuses to
 * start and immediately tells you exactly what's missing.
 *
 * Also: config values are only referenced in one place.
 * If an env variable name changes, you update one line, not 10.
 */
const required = (name) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `❌ Missing required environment variable: ${name}\n` +
      `   Check your .env file against .env.example`
    );
  }
  return value;
};
const optional = (name, defaultValue) => process.env[name] || defaultValue;
const config = {
  server: {
    port: parseInt(optional('PORT', '5000'), 10),
    nodeEnv: optional('NODE_ENV', 'development'),
    isDevelopment: optional('NODE_ENV', 'development') === 'development',
    isProduction: optional('NODE_ENV', 'development') === 'production',
  },
  cors: {
    frontendUrl: optional('FRONTEND_URL', 'http://localhost:3000'),
  },
  database: {
    url: required('DATABASE_URL'),
  },
  // auth: {
  //   jwtSecret: required('JWT_SECRET'),
  //   jwtExpiresIn: optional('JWT_EXPIRES_IN', '7d'),
  // },
  // redis: {
  //   url: required('REDIS_URL'),
  // },
};
module.exports = config;
