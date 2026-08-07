require('dotenv').config();

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
  // These will be uncommented as we add more phases:
  // database: {
  //   url: required('DATABASE_URL'),
  // },
  // auth: {
  //   jwtSecret: required('JWT_SECRET'),
  //   jwtExpiresIn: optional('JWT_EXPIRES_IN', '7d'),
  // },
  // redis: {
  //   url: required('REDIS_URL'),
  // },
};
module.exports = config;