# Hướng dẫn sử dụng TypeScript Types cho Database Operations

Tài liệu này giải thích cách sử dụng các type declarations cho các database operations trong dự án NextJS App Router.

## Cấu trúc thư mục

```
src/
├── lib/
│   ├── db.ts             # Chứa các hàm query và executeTransaction có kiểu generic
│   └── types/
│       ├── database.ts   # Định nghĩa các interface cho các bảng trong CSDL
│       └── index.ts      # Export tất cả các types
├── examples/
│   └── database-usage.ts # File ví dụ về cách sử dụng types với database operations
```

## Cách sử dụng

### 1. Import các hàm và types cần thiết

```typescript
import { query, QueryResult } from '../lib/db.js';
import { Movie, Genre } from '../lib/types/database';
// Hoặc import tất cả types
import * as DbTypes from '../lib/types/index';
```

### 2. Sử dụng hàm query với generic types

#### Lấy nhiều bản ghi:

```typescript
// Lấy danh sách phim
const movies: Movie[] = await query<Movie[]>('SELECT * FROM MOVIES ORDER BY release_date DESC');
```

#### Lấy một bản ghi:

```typescript
// Lấy thông tin chi tiết của một phim
const [movie] = await query<Movie[]>('SELECT * FROM MOVIES WHERE id_movie = ?', [id]);
// Hoặc
const movies = await query<Movie[]>('SELECT * FROM MOVIES WHERE id_movie = ?', [id]);
const movie = movies.length > 0 ? movies[0] : null;
```

#### Insert/Update với thông tin về kết quả:

```typescript
// Thêm phim mới
const result = await query<QueryResult>(
    `INSERT INTO MOVIES (title, ...) VALUES (?, ...)`,
    [title, ...]
);
const newMovieId = result.insertId;

// Cập nhật phim
const updateResult = await query<QueryResult>(
    'UPDATE MOVIES SET status = ? WHERE id_movie = ?',
    ['now_showing', movieId]
);
const affectedRows = updateResult.affectedRows;
```

### 3. Sử dụng các kiểu dữ liệu tùy chỉnh

Bạn có thể tạo các kiểu dữ liệu tùy chỉnh bằng cách mở rộng hoặc kết hợp các kiểu có sẵn:

```typescript
// Kết hợp Movie với thông tin về thể loại
interface MovieWithGenres extends Movie {
    genres: Genre[];
}

// Sử dụng
const moviesWithGenres: MovieWithGenres[] = [];
const allMovies = await query<Movie[]>('SELECT * FROM MOVIES');
    
for (const movie of allMovies) {
    const genres = await query<Genre[]>(
        `SELECT g.* FROM GENRE g JOIN GENRE_MOVIES gm ON g.id_genre = gm.id_genre WHERE gm.id_movie = ?`,
        [movie.id_movie]
    );
    
    moviesWithGenres.push({
        ...movie,
        genres
    });
}
```

### 4. Tạo kiểu dữ liệu cho các bảng mới

Khi bạn thêm bảng mới vào cơ sở dữ liệu, hãy thêm các interface tương ứng vào file `lib/types/database.ts`:

```typescript
export interface NewTable {
    id_something: number;
    name: string;
    // Thêm các trường khác của bảng
}
```

## Lưu ý quan trọng

1. Luôn sử dụng kiểu dữ liệu chính xác nhất có thể cho mỗi truy vấn để TypeScript có thể hỗ trợ phát hiện lỗi.

2. Khi làm việc với nhiều bảng hoặc kết quả JOIN phức tạp, hãy tạo interface mới để biểu diễn cấu trúc kết quả.

3. Sử dụng `QueryResult` cho các câu lệnh INSERT, UPDATE hoặc DELETE để truy cập thông tin như `insertId`, `affectedRows`.

4. Khi làm việc với các trường nullable trong database, hãy sử dụng Optional Properties (`?`) trong TypeScript interface.
