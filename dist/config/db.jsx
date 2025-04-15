import mysql from "mysql2/promise";
import dotenv from "dotenv";
// Tải biến môi trường từ file .env
dotenv.config();
// Tạo pool connections thay vì connection đơn lẻ để quản lý tốt hơn
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3307,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
// Kiểm tra kết nối khi khởi động
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log("Database connection established successfully!");
        connection.release();
        return true;
    }
    catch (error) {
        console.error("Failed to connect to database:", error);
        return false;
    }
};
// Thực hiện kiểm tra kết nối khi import
testConnection();
// Export pool để sử dụng trong các modules khác
export default pool;
