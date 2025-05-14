// Test database query for CINEMAS table
import { query } from '../src/lib/db.js';

async function testCinemaQuery() {
    try {
        console.log('Kiểm tra truy vấn trực tiếp bảng CINEMAS...');

        // Thử truy vấn không destructure
        const result = await query('SELECT * FROM CINEMAS ORDER BY id_cinema DESC');

        console.log('Kiểu dữ liệu của kết quả:', typeof result);
        console.log('Kết quả có phải mảng?', Array.isArray(result));
        console.log('Độ dài của mảng kết quả:', result.length);

        // Xử lý đúng cách với MySQL2
        const rows = result[0];
        const fields = result[1];

        console.log('Số lượng rạp:', Array.isArray(rows) ? rows.length : 0);

        if (Array.isArray(rows) && rows.length > 0) {
            console.log('Rạp đầu tiên:', rows[0]);
            console.log('ID của rạp đầu tiên:', rows[0].id_cinema);
            console.log('Tên của rạp đầu tiên:', rows[0].cinema_name);
        }

        console.log('Các trường trong bảng:', fields ? fields.map(f => f.name) : 'Không có thông tin trường');

    } catch (error) {
        console.error('Lỗi khi kiểm tra truy vấn:', error);
    } finally {
        // Đóng kết nối
        process.exit(0);
    }
}

testCinemaQuery().catch(console.error);
