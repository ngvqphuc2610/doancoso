// Script để ánh xạ giữa tên cột trong DB và trường dữ liệu trong code
const dbColumns = {
    movies: [
        'id_movie',
        'title',
        'original_title',
        'director',
        'actors', // <=== Trong code sử dụng là 'cast'
        'duration',
        'release_date',
        'end_date',
        'language',
        'subtitle',
        'country',
        'description',
        'poster_image', // <=== Trong code sử dụng là 'poster_url'
        'trailer_url',
        'age_restriction',
        'status'
    ],

    cinemas: [
        'id_cinema',
        'cinema_name',
        'address',
        'city',
        'description',
        'image', // <=== Trong code có thể sử dụng là 'image_url'
        'contact_number',
        'email',
        'status'
    ]
};

const codeFields = {
    movies: [
        'id_movie',
        'title',
        'original_title',
        'director',
        'cast', // <=== Trong DB sử dụng là 'actors'
        'duration',
        'release_date',
        'end_date',
        'language',
        'subtitle',
        'country',
        'description',
        'poster_url', // <=== Trong DB sử dụng là 'poster_image'
        'trailer_url',
        'age_restriction',
        'status',
        'genres' // (Không phải trường trong DB chính, lấy từ bảng liên kết genre_movies)
    ]
};

console.log('=== ĐIỀU CHỈNH CẦN LÀM ===');
console.log('1. Thay thế poster_url -> poster_image trong cả hàm UPDATE và INSERT');
console.log('2. Thay thế cast -> actors trong cả hàm UPDATE và INSERT');
console.log('3. Đảm bảo sử dụng fallback trong formatMovies:');
console.log('   - poster_url = movie.poster_image');
console.log('   - cast = movie.actors');
console.log('\nTest các thay đổi này để đảm bảo việc sửa lỗi thành công!');
