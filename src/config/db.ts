"use server";

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Đảm bảo các biến môi trường cần thiết tồn tại
const requiredEnvVars = ['DB_HOST', 'DB_NAME', 'DB_USERNAME'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
    console.error(`Lỗi: Thiếu các biến môi trường cần thiết: ${missingEnvVars.join(', ')}`);
    console.error('Vui lòng kiểm tra file .env của bạn');
    // Trong môi trường production, chúng ta có thể muốn thoát
    // process.exit(1);
}

// Database connection pool với cấu hình tốt hơn
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3307'),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000, // 10 giây
    charset: 'utf8mb4',
    // Timeout settings
    connectTimeout: 10000, // 10 giây
    // Xử lý các trường hợp lỗi kết nối
    multipleStatements: false // Vô hiệu hóa nhiều statements để ngăn SQL injection
});

// Hàm thử kết nối với số lần retry
const testConnection = async (retries = 3, delay = 2000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const connection = await pool.getConnection();
            console.log('Kết nối database thành công!');
            console.log('Database Info:', {
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                user: process.env.DB_USERNAME,
                database: process.env.DB_NAME,
                password: process.env.DB_PASSWORD 
            });

            // Kiểm tra database có thật sự hoạt động
            await connection.ping();

            // Thực hiện query đơn giản để test
            const [result] = await connection.query('SELECT 1 as test');
            connection.release();
            return true;
        } catch (err) {
            console.error(`Lỗi kết nối database (lần thử ${attempt}/${retries}):`, err);

            if (attempt < retries) {
                console.log(`Thử kết nối lại sau ${delay / 1000} giây...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                console.error('Không thể kết nối đến database sau nhiều lần thử. Vui lòng kiểm tra cấu hình database của bạn.');
            }
        }
    }

    return false;
};

// Thử kết nối khi import module
testConnection()
    .then(success => {
        if (!success) {
            console.warn('Ứng dụng sẽ tiếp tục chạy nhưng các tính năng liên quan đến database có thể không hoạt động.');
        }
    });

// Export pool để sử dụng trong các modules khác
export default pool;

// Helper function cho các truy vấn với retry logic
export async function query(sql: string, params?: any[], retries = 2): Promise<any> {
    try {
        const [rows] = await pool.execute(sql, params);
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