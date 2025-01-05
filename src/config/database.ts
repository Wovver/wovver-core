// filepath: /C:/Projects/backend-nest/backend-nest/src/config/database.ts
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Get the database URL from the environment variable
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

// Create a Sequelize instance using the DATABASE_URL
const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false, // Disable logging for production (you can enable it for dev)
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // You may need to adjust this based on your SSL configuration
    }
  }
});

export default sequelize;