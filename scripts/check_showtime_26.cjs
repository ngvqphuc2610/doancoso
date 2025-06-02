const mysql = require('mysql2/promise');

// Database config (sử dụng config từ .env)
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'bookingcinema',
    port: 3307
};

async function checkShowtime26() {
    let connection;

    try {
        console.log('🔌 Đang kết nối database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Kết nối database thành công!');

        // 1. Kiểm tra showtime ID 26
        console.log('\n🎯 Kiểm tra showtime ID 26:');
        const [showtime26] = await connection.query(
            'SELECT * FROM showtimes WHERE id_showtime = ?',
            [26]
        );

        if (showtime26.length > 0) {
            console.log('✅ Tìm thấy showtime ID 26:');
            console.log(showtime26[0]);
        } else {
            console.log('❌ Không tìm thấy showtime ID 26');
        }

        // 2. Kiểm tra tất cả showtimes cho movie 44
        console.log('\n🎬 Tất cả showtimes cho movie 44:');
        const [movie44Showtimes] = await connection.query(
            'SELECT * FROM showtimes WHERE id_movie = ? ORDER BY show_date, start_time',
            [44]
        );

        console.log(`📊 Tìm thấy ${movie44Showtimes.length} showtimes cho movie 44:`);
        movie44Showtimes.forEach(st => {
            console.log(`- ID: ${st.id_showtime}, Date: ${st.show_date}, Time: ${st.start_time}, Status: ${st.status}`);
        });

        // 3. Kiểm tra showtimes từ ngày 2/6 trở đi
        console.log('\n📅 Showtimes từ 2025-06-02 trở đi:');
        const [futureShowtimes] = await connection.query(`
            SELECT 
                st.id_showtime,
                st.id_movie,
                st.show_date,
                st.start_time,
                st.status,
                m.title as movie_title
            FROM showtimes st
            LEFT JOIN movies m ON st.id_movie = m.id_movie
            WHERE st.show_date >= '2025-06-02'
            AND st.status = 'available'
            ORDER BY st.show_date, st.start_time
        `);

        console.log(`📊 Tìm thấy ${futureShowtimes.length} showtimes từ 2025-06-02:`);
        futureShowtimes.forEach(st => {
            console.log(`- ID: ${st.id_showtime}, Movie: ${st.id_movie} (${st.movie_title}), Date: ${st.show_date}, Time: ${st.start_time}`);
        });

        // 4. Kiểm tra current date
        console.log('\n🕐 Current date từ database:');
        const [currentDate] = await connection.query('SELECT CURDATE() as current_date, NOW() as current_datetime');
        console.log('Current date:', currentDate[0]);

        // 5. Kiểm tra API query giống như trong route
        console.log('\n🔍 Test API query (giống như route):');
        const [apiResult] = await connection.query(`
            SELECT
                st.id_showtime,
                st.id_movie,
                st.id_screen,
                st.start_time,
                st.start_time as show_time,
                st.end_time,
                st.show_date,
                st.format,
                st.language,
                st.subtitle,
                st.status,
                st.price,
                m.title as movie_title,
                m.poster_image,
                m.duration,
                m.director,
                m.actors,
                m.country,
                m.age_restriction,
                sc.screen_name,
                sc.capacity,
                c.id_cinema,
                c.cinema_name,
                c.address as cinema_address,
                c.contact_number as cinema_phone
            FROM showtimes st
            LEFT JOIN movies m ON st.id_movie = m.id_movie
            LEFT JOIN screen sc ON st.id_screen = sc.id_screen
            LEFT JOIN cinemas c ON sc.id_cinema = c.id_cinema
            WHERE st.show_date >= '2025-06-02'
            AND st.status = 'available'
            ORDER BY st.show_date ASC, st.start_time ASC, c.cinema_name ASC
        `);

        console.log(`📊 API query trả về ${apiResult.length} showtimes:`);
        apiResult.forEach(st => {
            if (st.id_movie == 44) {
                console.log(`🎯 Movie 44: ID ${st.id_showtime}, Date: ${st.show_date}, Time: ${st.start_time}`);
            }
        });

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Đã đóng kết nối database');
        }
    }
}

checkShowtime26();
