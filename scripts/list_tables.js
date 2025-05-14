// Script để liệt kê tất cả các bảng trong database
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

// Tự động xác định đường dẫn tới file .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const envPath = join(rootDir, '.env');

// Tải biến môi trường
dotenv.config({ path: envPath });

// In ra thông số kết nối để debug
console.log('Database connection parameters:');
console.log('- DB_HOST:', process.env.DB_HOST);
console.log('- DB_PORT:', process.env.DB_PORT);
console.log('- DB_NAME:', process.env.DB_NAME);
console.log('- DB_USERNAME:', process.env.DB_USERNAME);
console.log('- DB_PASSWORD:', process.env.DB_PASSWORD ? '******' : 'not set');

async function listTables() {
    let connection;
    try {
        console.log('Đang kết nối đến MySQL...');

        // Tạo kết nối
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USERNAME || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'bookingcinema'
        });

        console.log('Kết nối thành công!');

        // Liệt kê tất cả các bảng
        console.log('\n=== Danh sách các bảng trong database ===');
        const [tables] = await connection.query('SHOW TABLES');

        if (tables.length === 0) {
            console.log('Không có bảng nào trong database!');
        } else {
            tables.forEach((table, index) => {
                // Lấy tên bảng (khác nhau tùy thuộc vào phiên bản MySQL)
                const tableName = Object.values(table)[0];
                console.log(`${index + 1}. ${tableName}`);
            });
        }

        // Kiểm tra cấu trúc các bảng quan trọng
        await checkTableStructure(connection, 'MOVIES');
        await checkTableStructure(connection, 'cinemas');
        await checkTableStructure(connection, 'cinema');

        console.log('\n=== Kiểm tra dữ liệu ===');
        await checkTableData(connection, 'MOVIES');
        await checkTableData(connection, 'cinemas');
        await checkTableData(connection, 'cinema');

    } catch (error) {
        console.error('Lỗi:', error);
    } finally {
        if (connection) {
            console.log('Đóng kết nối...');
            await connection.end();
        }
    }
}

// Hàm kiểm tra cấu trúc bảng
async function checkTableStructure(connection, tableName) {
    try {
        console.log(`\n=== Cấu trúc bảng ${tableName} ===`);
        const [columns] = await connection.query(`SHOW COLUMNS FROM ${tableName}`);

        if (columns.length === 0) {
            console.log(`Không thể lấy thông tin cấu trúc bảng ${tableName}`);
        } else {
            columns.forEach(column => {
                console.log(`- ${column.Field}: ${column.Type} ${column.Null === 'YES' ? '(Nullable)' : '(Not Null)'} ${column.Key === 'PRI' ? '(Primary Key)' : ''}`);
            });
        }
    } catch (error) {
        console.log(`Bảng ${tableName} không tồn tại hoặc có lỗi: ${error.message}`);
    }
}

// Hàm kiểm tra dữ liệu trong bảng
async function checkTableData(connection, tableName) {
    try {
        const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`Bảng ${tableName}: ${rows[0].count} bản ghi`);

        if (rows[0].count > 0) {
            const [sampleData] = await connection.query(`SELECT * FROM ${tableName} LIMIT 1`);
            console.log(`Mẫu dữ liệu: `, JSON.stringify(sampleData[0], null, 2));
        }
    } catch (error) {
        console.log(`Không thể truy vấn dữ liệu từ bảng ${tableName}: ${error.message}`);
    }
}

// Chạy chương trình
listTables().catch(error => {
    console.error('Lỗi không xử lý được:', error);
    process.exit(1);
});
