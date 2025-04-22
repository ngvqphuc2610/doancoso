import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Tạo pool connection
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USERNAME || 'root',  // Changed from DB_USER to DB_USERNAME
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME ,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default pool;