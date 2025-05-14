// Script kiểm tra bảng trong database
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
    console.log('Bắt đầu kiểm tra kết nối database...');
    console.log('Thông tin kết nối:');
    console.log(`  Host: ${process.env.DB_HOST || 'không định nghĩa'}`);
    console.log(`  Port: ${process.env.DB_PORT || '3306'}`);
    console.log(`  User: ${process.env.DB_USERNAME || 'không định nghĩa'}`);
    console.log(`  Database: ${process.env.DB_NAME || 'không định nghĩa'}`);

    try {
        // Tạo kết nối đến database
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('\n✅ Kết nối đến database thành công!');

        // Liệt kê tất cả các bảng
        console.log('\nĐang kiểm tra danh sách bảng...');
        const [tables] = await connection.query('SHOW TABLES');

        console.log(`\nCó ${tables.length} bảng trong database:`);

        // Hiển thị tên các bảng cùng với case sensitivity
        for (const table of tables) {
            const tableName = Object.values(table)[0];
            console.log(`  - ${tableName}`);

            // Thử truy vấn một bản ghi từ bảng này
            try {
                const [rows] = await connection.query(`SELECT * FROM ${tableName} LIMIT 1`);
                console.log(`    ✓ Có thể truy vấn bảng này (${rows.length} bản ghi)`);
            } catch (error) {
                console.error(`    ✗ Lỗi khi truy vấn bảng: ${error.message}`);
            }
        }

        // Kiểm tra riêng bảng CINEMAS và MOVIES
        console.log('\nKiểm tra đặc biệt cho bảng CINEMAS:');

        try {
            // Thử các cách khác nhau để truy vấn bảng CINEMAS
            const queries = [
                'SELECT * FROM CINEMAS LIMIT 1',
                'SELECT * FROM cinemas LIMIT 1',
                'SELECT * FROM Cinemas LIMIT 1',
                'SELECT * FROM `CINEMAS` LIMIT 1',
                'SELECT * FROM `cinemas` LIMIT 1'
            ];

            for (const q of queries) {
                try {
                    console.log(`  Thử truy vấn: ${q}`);
                    const [rows] = await connection.query(q);
                    console.log(`    ✓ Thành công: ${rows.length} bản ghi`);
                } catch (error) {
                    console.error(`    ✗ Lỗi: ${error.message}`);
                }
                await sleep(100); // Tạm dừng để tránh quá nhiều truy vấn
            }
        } catch (error) {
            console.error('Lỗi khi kiểm tra bảng CINEMAS:', error);
        }

        // Kiểm tra schema của bảng CINEMAS
        try {
            console.log('\nCấu trúc bảng CINEMAS:');
            const [columns] = await connection.query('SHOW COLUMNS FROM CINEMAS');
            columns.forEach(col => {
                console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
            });
        } catch (error) {
            console.error('Lỗi khi lấy cấu trúc bảng CINEMAS:', error.message);

            // Thử lại với tên bảng khác
            try {
                console.log('\nThử lấy cấu trúc bảng cinemas (chữ thường):');
                const [columns] = await connection.query('SHOW COLUMNS FROM cinemas');
                columns.forEach(col => {
                    console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
                });
            } catch (innerError) {
                console.error('Cũng không thể lấy cấu trúc bảng cinemas:', innerError.message);
            }
        }

        console.log('\nKết thúc kiểm tra.');
        await connection.end();

    } catch (error) {
        console.error('❌ Lỗi kết nối đến database:', error);
        console.error('\nVui lòng kiểm tra:');
        console.error('1. Thông tin kết nối trong file .env có chính xác không');
        console.error('2. Dịch vụ MySQL đã được khởi động chưa');
        console.error('3. Firewall có chặn kết nối không');
    }
}

main().catch(console.error);
