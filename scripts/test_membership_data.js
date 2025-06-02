import mysql from 'mysql2/promise';

// Cấu hình kết nối database
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'bookingcinema',
    port: 3307
};

async function testMembershipData() {
    let connection;

    try {
        console.log('🔄 Đang kết nối đến database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Kết nối database thành công!');

        // Kiểm tra bảng membership có tồn tại không
        console.log('\n📋 Kiểm tra bảng membership...');
        const [tables] = await connection.query("SHOW TABLES LIKE 'membership'");

        if (tables.length === 0) {
            console.log('❌ Bảng membership không tồn tại!');

            // Tạo bảng membership
            console.log('🔧 Tạo bảng membership...');
            await connection.query(`
                CREATE TABLE membership (
                    id_membership int NOT NULL AUTO_INCREMENT,
                    code varchar(50) NOT NULL,
                    title varchar(100) NOT NULL,
                    image varchar(255) DEFAULT NULL,
                    link varchar(255) DEFAULT NULL,
                    description text,
                    benefits text,
                    criteria text,
                    status enum('active','inactive') DEFAULT 'active',
                    PRIMARY KEY (id_membership),
                    UNIQUE KEY UQ_MembershipCode (code)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
            `);
            console.log('✅ Đã tạo bảng membership!');
        } else {
            console.log('✅ Bảng membership đã tồn tại');
        }

        // Kiểm tra dữ liệu trong bảng
        console.log('\n📊 Kiểm tra dữ liệu trong bảng membership...');
        const [rows] = await connection.query('SELECT * FROM membership');

        console.log(`📈 Tìm thấy ${rows.length} bản ghi trong bảng membership:`);

        if (rows.length === 0) {
            console.log('📝 Thêm dữ liệu mẫu...');

            // Thêm dữ liệu mẫu với hình ảnh đẹp
            await connection.query(`
                INSERT INTO membership (code, title, image, description, benefits, criteria, status) VALUES
                ('C_FRIEND', 'THÀNH VIÊN C''FRIEND', 'https://images.unsplash.com/photo-1489599735734-79b4169c4388?w=800&h=600&fit=crop&crop=center', 'Thẻ C''Friend nhiều ưu đãi cho thành viên mới', 'Quyền lợi, Giảm giá vé cho học sinh sinh viên, Ưu đãi bắp nước vào các ngày trong tuần', 'Đăng ký thành viên mới hoặc học sinh sinh viên', 'active'),
                ('C_VIP', 'THÀNH VIÊN C''VIP', 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop&crop=center', 'Thẻ VIP CineStar mang đến sự ưu đãi độc quyền', 'Quyền lợi, Ưu đãi giá vé VIP, Tặng bắp nước miễn phí vào ngày sinh nhật', 'Tích lũy >= 2 triệu đồng hoặc >= 500 điểm thưởng/tháng', 'active')
            `);

            console.log('✅ Đã thêm dữ liệu mẫu!');

            // Kiểm tra lại
            const [newRows] = await connection.query('SELECT * FROM membership');
            console.log(`📈 Hiện có ${newRows.length} bản ghi trong bảng membership`);
        }

        // Hiển thị chi tiết dữ liệu
        console.log('\n📋 Chi tiết dữ liệu membership:');
        rows.forEach((row, index) => {
            console.log(`\n[${index + 1}] ID: ${row.id_membership}`);
            console.log(`    Code: ${row.code}`);
            console.log(`    Title: ${row.title}`);
            console.log(`    Status: ${row.status}`);
            console.log(`    Description: ${row.description ? row.description.substring(0, 50) + '...' : 'N/A'}`);
        });

        // Test API query
        console.log('\n🔍 Test query giống như API:');
        const [apiRows] = await connection.query(`
            SELECT m.*
            FROM membership m
            WHERE m.status = 'active'
            ORDER BY m.id_membership ASC
        `);

        console.log(`📊 Query API trả về ${apiRows.length} bản ghi:`);
        apiRows.forEach((row, index) => {
            console.log(`  [${index + 1}] ${row.code} - ${row.title} (${row.status})`);
        });

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        console.error('Stack trace:', error.stack);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Đã đóng kết nối database');
        }
    }
}

// Chạy test
testMembershipData().catch(error => {
    console.error('❌ Lỗi không xử lý được:', error);
    process.exit(1);
});
