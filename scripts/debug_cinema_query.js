// Debug Cinema Query
// filepath: d:\DOANCOSO\doancoso\scripts\debug_cinema_query.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Tạo kết nối trực tiếp
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cinestar',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Hàm query đơn giản
async function query(sql, params) {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Error executing query:', error);
        throw error;
    }
}

async function debugCinemaQuery() {
    try {
        console.log('===== DEBUG CINEMA QUERY =====');
        console.log('Đang kiểm tra kết nối và cấu trúc dữ liệu...');

        // Kiểm tra bảng CINEMAS có tồn tại không
        console.log('1. Kiểm tra sự tồn tại của bảng CINEMAS:');
        const tableCheck = await query('SHOW TABLES LIKE "CINEMAS"');
        console.log('Kết quả kiểm tra bảng:', tableCheck);
        console.log('Bảng CINEMAS tồn tại:', tableCheck.length > 0);

        if (tableCheck.length === 0) {
            console.log('Bảng CINEMAS không tồn tại! Có thể bảng có tên khác.');

            // Liệt kê tất cả các bảng để xem tên chính xác
            console.log('Danh sách tất cả các bảng:');
            const allTables = await query('SHOW TABLES');
            console.log(allTables);

            // Tìm kiếm bảng có tên gần giống
            console.log('Tìm bảng có tên tương tự "cinema":');
            const similarTables = allTables.filter(table => {
                // Lấy tên bảng từ kết quả (phụ thuộc vào cấu trúc dữ liệu trả về)
                const tableName = Object.values(table)[0].toLowerCase();
                return tableName.includes('cinema');
            });

            console.log('Các bảng tương tự:', similarTables);
        } else {
            // Nếu bảng tồn tại, kiểm tra cấu trúc
            console.log('2. Kiểm tra cấu trúc của bảng CINEMAS:');
            const structure = await query('DESCRIBE CINEMAS');
            console.log('Cấu trúc bảng CINEMAS:', structure);

            // Đếm số lượng bản ghi
            console.log('3. Đếm số lượng rạp trong bảng:');
            const countResult = await query('SELECT COUNT(*) as count FROM CINEMAS');
            console.log('Số lượng rạp:', countResult[0].count);

            // Lấy tất cả rạp
            console.log('4. Lấy danh sách tất cả rạp:');
            const cinemas = await query('SELECT * FROM CINEMAS ORDER BY id_cinema DESC');
            console.log('Kiểu dữ liệu kết quả:', typeof cinemas);
            console.log('Có phải mảng không:', Array.isArray(cinemas));
            console.log('Độ dài:', Array.isArray(cinemas) ? cinemas.length : 'không phải mảng');
            console.log('Nội dung đầy đủ:', cinemas);

            // Thử tạo lại kết quả API
            console.log('5. Mô phỏng kết quả API:');
            console.log({
                success: true,
                data: cinemas
            });
        }
    } catch (error) {
        console.error('Lỗi khi debug query:', error);
    } finally {
        // Đóng kết nối
        process.exit(0);
    }
}

debugCinemaQuery().catch(console.error);
