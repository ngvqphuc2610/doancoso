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

// Tạo pool connection
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Kiểm tra kết nối
pool.getConnection()
    .then(connection => {
        console.log('✅ Đã kết nối thành công đến MySQL');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Lỗi kết nối MySQL:', err.message);
        console.error('Kiểm tra lại tên người dùng, mật khẩu, host và port kết nối');
        console.error('Chi tiết lỗi:', err);
    });

export default pool;