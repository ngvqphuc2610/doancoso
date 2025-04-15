import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();
// Database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cinestar_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
// Test the connection
pool.getConnection()
    .then(connection => {
    console.log('Database connection was successful');
    connection.release();
})
    .catch(err => {
    console.error('Error connecting to the database:', err);
});
export default pool;
