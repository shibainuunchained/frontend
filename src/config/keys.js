const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  jwtSecret: process.env.JWT_SECRET,
  encryptionKey: process.env.ENCRYPTION_KEY,
  mongoURI: process.env.MONGODB_URI,
};