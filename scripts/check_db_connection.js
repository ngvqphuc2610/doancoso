// Kiểm tra kết nối cơ sở dữ liệu và truy vấn trực tiếp
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Tải biến môi trường
dotenv.config();

// Lấy thư mục hiện tại
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Nhật ký lỗi
async function logError(message, error) {
    const logFile = path.join(__dirname, 'db_debug.log');
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}: ${error.message}\n${error.stack}\n\n`;

    try {
        await fs.appendFile(logFile, logEntry);
        console.log(`Đã ghi log lỗi vào ${logFile}`);
    } catch (err) {
        console.error('Lỗi khi ghi log:', err);
    }
}

// Hàm chính để kiểm tra kết nối
async function checkDatabaseConnection() {
    console.log('Kiểm tra kết nối cơ sở dữ liệu...');

    // Hiển thị thông tin kết nối (che đi mật khẩu)
    console.log('Thông tin kết nối:');
    console.log(`- Host: ${process.env.DB_HOST}`);
    console.log(`- Port: ${process.env.DB_PORT || '3307'}`);
    console.log(`- User: ${process.env.DB_USERNAME}`);
    console.log(`- Database: ${process.env.DB_NAME}`);

    try {
        // Tạo kết nối
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '3307'),
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('✅ Kết nối cơ sở dữ liệu thành công!');

        // Kiểm tra danh sách các bảng
        console.log('\nDanh sách các bảng:');
        const [tables] = await connection.query('SHOW TABLES');
        tables.forEach(table => {
            const tableName = Object.values(table)[0];
            console.log(`- ${tableName}`);
        });

        // Kiểm tra cấu trúc bảng cinemas
        try {
            console.log('\nKiểm tra bảng cinemas:');
            const [structure] = await connection.query('DESCRIBE cinemas');
            console.log('Cấu trúc bảng cinemas:');
            structure.forEach(field => {
                console.log(`- ${field.Field} (${field.Type}${field.Null === 'NO' ? ', NOT NULL' : ''}${field.Key === 'PRI' ? ', PRIMARY KEY' : ''})`);
            });

            // Kiểm tra dữ liệu trong bảng cinemas
            console.log('\nDữ liệu trong bảng cinemas:');
            const [rows] = await connection.query('SELECT * FROM cinemas');

            if (rows.length === 0) {
                console.log('Không có dữ liệu trong bảng cinemas.');

                // Thêm dữ liệu mẫu
                console.log('Thêm dữ liệu mẫu vào bảng cinemas...');
                await connection.query(`
          INSERT INTO cinemas (cinema_name, address, contact_number, status) VALUES
          ('Cinestar Đà Lạt', 'Số 1 Đường Trần Hưng Đạo, Phường 3, TP. Đà Lạt', '0263 123 456', 'active'),
          ('Cinestar Quốc Thanh', 'Số 271 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh', '028 3926 2222', 'active'),
          ('Cinestar Hai Bà Trưng', '135 Hai Bà Trưng, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh', '028 3823 9999', 'active')
        `);

                // Kiểm tra lại dữ liệu
                const [newRows] = await connection.query('SELECT * FROM cinemas');
                console.log(`Đã thêm ${newRows.length} bản ghi vào bảng cinemas.`);
            } else {
                console.log(`Có ${rows.length} bản ghi trong bảng cinemas:`);
                rows.forEach((row, index) => {
                    console.log(`[${index + 1}] ID: ${row.id_cinema}, Tên: ${row.cinema_name}, Trạng thái: ${row.status}`);
                });
            }
        } catch (error) {
            if (error.message.includes("doesn't exist")) {
                console.error('❌ Bảng cinemas không tồn tại.');
                console.log('Tạo bảng cinemas...');

                // Tạo bảng cinemas
                await connection.query(`
          CREATE TABLE IF NOT EXISTS cinemas (
            id_cinema int(11) NOT NULL AUTO_INCREMENT,
            cinema_name varchar(255) NOT NULL,
            address text NOT NULL,
            contact_number varchar(20) DEFAULT NULL,
            status enum('active','inactive') DEFAULT 'active',
            created_at timestamp NULL DEFAULT current_timestamp(),
            updated_at timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
            PRIMARY KEY (id_cinema)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

                console.log('✅ Đã tạo bảng cinemas thành công!');

                // Thêm dữ liệu mẫu
                console.log('Thêm dữ liệu mẫu vào bảng cinemas...');
                await connection.query(`
          INSERT INTO cinemas (cinema_name, address, contact_number, status) VALUES
          ('Cinestar Đà Lạt', 'Số 1 Đường Trần Hưng Đạo, Phường 3, TP. Đà Lạt', '0263 123 456', 'active'),
          ('Cinestar Quốc Thanh', 'Số 271 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh', '028 3926 2222', 'active'),
          ('Cinestar Hai Bà Trưng', '135 Hai Bà Trưng, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh', '028 3823 9999', 'active')
        `);

                // Kiểm tra lại dữ liệu
                const [newRows] = await connection.query('SELECT * FROM cinemas');
                console.log(`Đã thêm ${newRows.length} bản ghi vào bảng cinemas.`);
            } else {
                await logError('Lỗi khi kiểm tra bảng cinemas', error);
                console.error('❌ Lỗi khi kiểm tra bảng cinemas:', error.message);
            }
        }

        // Đóng kết nối
        await connection.end();
        console.log('\nĐã đóng kết nối cơ sở dữ liệu.');

    } catch (error) {
        await logError('Lỗi kết nối cơ sở dữ liệu', error);
        console.error('❌ Lỗi kết nối cơ sở dữ liệu:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Thực thi hàm kiểm tra
checkDatabaseConnection().catch(error => {
    console.error('Lỗi không xác định:', error);
    process.exit(1);
});
