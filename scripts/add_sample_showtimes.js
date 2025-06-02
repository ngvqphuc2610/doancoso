const mysql = require('mysql2/promise');

// Cấu hình kết nối database
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'bookingcinema',
    port: 3307
};

async function addSampleShowtimes() {
    let connection;
    
    try {
        console.log('🔌 Đang kết nối database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Kết nối database thành công!');

        // Kiểm tra dữ liệu hiện tại
        const [existingShowtimes] = await connection.query('SELECT COUNT(*) as count FROM showtimes');
        console.log(`📊 Hiện có ${existingShowtimes[0].count} showtimes trong database`);

        // Lấy danh sách movies, screens, cinemas
        const [movies] = await connection.query('SELECT id_movie, title FROM movies LIMIT 5');
        const [screens] = await connection.query(`
            SELECT s.id_screen, s.screen_name, c.id_cinema, c.cinema_name 
            FROM screen s 
            JOIN cinemas c ON s.id_cinema = c.id_cinema 
            LIMIT 10
        `);

        console.log(`🎬 Tìm thấy ${movies.length} movies`);
        console.log(`🏢 Tìm thấy ${screens.length} screens`);

        if (movies.length === 0 || screens.length === 0) {
            console.log('❌ Không có movies hoặc screens để tạo showtimes');
            return;
        }

        // Xóa showtimes cũ (nếu có)
        await connection.query('DELETE FROM showtimes WHERE show_date >= CURDATE()');
        console.log('🗑️ Đã xóa showtimes cũ');

        // Tạo showtimes cho 7 ngày tới
        const showtimesToInsert = [];
        const today = new Date();
        
        for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
            const showDate = new Date(today);
            showDate.setDate(today.getDate() + dayOffset);
            const dateStr = showDate.toISOString().split('T')[0]; // YYYY-MM-DD

            // Tạo showtimes cho mỗi movie và screen
            for (const movie of movies) {
                for (const screen of screens) {
                    // Tạo 3-4 suất chiếu mỗi ngày cho mỗi movie-screen combination
                    const times = ['10:00:00', '14:30:00', '18:00:00', '21:30:00'];
                    
                    for (const startTime of times) {
                        // Tính end_time (giả sử phim dài 120 phút)
                        const [hours, minutes] = startTime.split(':').map(Number);
                        const endDate = new Date();
                        endDate.setHours(hours, minutes + 120, 0, 0);
                        const endTime = endDate.toTimeString().split(' ')[0];

                        showtimesToInsert.push([
                            movie.id_movie,
                            screen.id_screen,
                            startTime,
                            endTime,
                            dateStr,
                            '2D',
                            'Tiếng Việt',
                            'Phụ đề Tiếng Anh',
                            'available',
                            100000 // price
                        ]);
                    }
                }
            }
        }

        // Insert showtimes
        if (showtimesToInsert.length > 0) {
            const insertQuery = `
                INSERT INTO showtimes 
                (id_movie, id_screen, start_time, end_time, show_date, format, language, subtitle, status, price) 
                VALUES ?
            `;
            
            await connection.query(insertQuery, [showtimesToInsert]);
            console.log(`✅ Đã thêm ${showtimesToInsert.length} showtimes mẫu!`);

            // Kiểm tra lại
            const [newCount] = await connection.query('SELECT COUNT(*) as count FROM showtimes');
            console.log(`📈 Hiện có ${newCount[0].count} showtimes trong database`);

            // Hiển thị một vài showtimes mẫu
            const [sampleShowtimes] = await connection.query(`
                SELECT 
                    st.id_showtime,
                    m.title as movie_title,
                    c.cinema_name,
                    sc.screen_name,
                    st.show_date,
                    st.start_time,
                    st.status
                FROM showtimes st
                LEFT JOIN movies m ON st.id_movie = m.id_movie
                LEFT JOIN screen sc ON st.id_screen = sc.id_screen
                LEFT JOIN cinemas c ON sc.id_cinema = c.id_cinema
                ORDER BY st.show_date, st.start_time
                LIMIT 10
            `);

            console.log('\n📋 Một vài showtimes mẫu:');
            sampleShowtimes.forEach(st => {
                console.log(`- ${st.movie_title} | ${st.cinema_name} - ${st.screen_name} | ${st.show_date} ${st.start_time} | ${st.status}`);
            });
        }

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Đã đóng kết nối database');
        }
    }
}

// Chạy script
addSampleShowtimes();
