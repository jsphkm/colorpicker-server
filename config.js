module.exports = {
  PORT: process.env.PORT || 8080,
  DATABASE_URL: process.env.DATABASE_URL || 'mongodb://localhost:27017/colorpicker',
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'mongodb://localhost:27017/test-colorpicker',
  JWT_SECRET: process.env.JWT_SECRET || 'default',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '7d',
  CLIENT_ORIGIN: 'https://colorpicker-client.herokuapp.com' || 'localhost:3000',
}