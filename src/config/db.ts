
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Log thông tin kết nối (loại bỏ mật khẩu thật trong log)
console.log('MySQL Connection Info:');
console.log(`- Host: ${process.env.DB_HOST || 'localhost'}`);
console.log(`- Port: ${process.env.DB_PORT || 3306}`);
console.log(`- User: ${process.env.DB_USERNAME || 'root'}`);
console.log(`- Password: ${process.env.DB_PASSWORD ? '[PROVIDED]' : '[EMPTY]'}`);
console.log(`- Database: ${process.env.DB_NAME || ''}`);

// Đảm bảo các biến môi trường cần thiết tồn tại
const requiredEnvVars = ['DB_HOST', 'DB_NAME', 'DB_USERNAME', 'DB_PASSWORD'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
    console.error(`Lỗi: Thiếu các biến môi trường cần thiết: ${missingEnvVars.join(', ')}`);
    console.error('Vui lòng kiểm tra file .env của bạn');
    process.exit(1); // Thoát luôn nếu thiếu biến môi trường
}

// Database connection pool với cấu hình tốt hơn
export const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3307', 10),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Export mặc định pool
export default db;

// Helper function cho các truy vấn với retry logic
export async function query(sql: string, params?: any[], retries = 2): Promise<any> {
    try {
        // Đảm bảo params luôn là array, không phải undefined
        const queryParams = params || [];
        const [rows] = await db.execute(sql, queryParams);
        return rows;
    } catch (err: any) {
        // Nếu lỗi là do mất kết nối và còn lần retry
        if ((err.code === 'PROTOCOL_CONNECTION_LOST' ||
            err.code === 'ECONNREFUSED' ||
            err.code === 'ETIMEDOUT') && retries > 0) {
            console.log(`Kết nối database bị mất. Thử kết nối lại... (còn ${retries} lần thử)`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return query(sql, params, retries - 1);
        }

        console.error('Lỗi truy vấn database:', err);
        throw err;
    }
}