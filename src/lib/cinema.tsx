export interface Cinema {
    id: string;
    name: string;
    address: string;
}

export interface Showtime {
    time: string;
    link: string;
}

export interface CinemaShowtimes {
    cinema: Cinema;
    movies: {
        id: string;
        title: string;
        poster: string;
        genre?: string;
        duration?: number;
        format?: string;
        showTimes: {
            standard?: Showtime[];
            deluxe?: Showtime[];
        };
    }[];
}

// Danh sách rạp chiếu phim
export const cinemas: Cinema[] = [
    { id: 'dl', name: 'Cinestar Đà Lạt (TP. Đà Lạt)',
        address: 'Số 1 Đường Trần Hưng Đạo, Phường 3, TP. Đà Lạt' 
     },
    { id: 'qt', name: 'Cinestar Quốc Thanh (TP.HCM)',
        address: '271 Đ. Nguyễn Trãi, Phường Nguyễn Cư Trinh, Quận 1, Hồ Chí Minh 70000' 
     },
    { id: 'hbt', name: 'Cinestar Hai Bà Trưng (TP.HCM)',
        address: '135 Hai Bà Trưng, Phường Bến Nghé, Quận 1, Thành Phố Hồ Chí Minh' 
     },
    { id: 'bd', name: 'CINESTAR SINH VIÊN(Bình Dương)',
        address: 'Nhà văn hóa sinh viên, Đại học Quốc gia HCM, P.Đông Hòa,Dĩ An, Bình Dương' 
     },
    { id: 'mt', name: 'Cinestar Mỹ Tho (Tiền Giang)',
        address: '52 Đinh Bộ Lĩnh, Phường 3, TP. Mỹ Tho, Tiền Giang' 
     },
    { id: 'kd', name: 'Cinestar Kiên Giang (TP. Kiên Giang)',
        address: 'Lô A2 - Khu 2 Trung tâm thương mại Rạch Sỏi,Đường Nguyễn Trí Thanh,Phường Rạch Sỏi,Thành Phố Rạch Giá, TP. Kiên Giang' 
     },
    { id: 'ld', name: 'Cinestar Lâm Đồng (TP. Lâm Đồng)',
        address: '713 QL20, Liên Nghĩa,Đức Trọng TP. Lâm Đồng' 
     },
    { id: 'hue', name: 'Cinestar Huế(TP. Huế)',
        address: '25 Hai Bà Trưng, Vĩnh Ninh, Quận Thuận Hóa, TP. Huế' 
     },
    { id: 'q6', name: 'Cinestar Quận 6 (TP.HCM)',
        address: 'Số 1 Đường Trần Hưng Đạo, Phường 3, TP. Đà Lạt' 
     },
];

// Cấu trúc giờ chiếu
export const standardShowtimes: Showtime[] = [
    { time: '10:30', link: '#' },
    { time: '12:45', link: '#' },
    { time: '15:20', link: '#' },
    { time: '18:30', link: '#' },
    { time: '20:15', link: '#' },
    { time: '22:45', link: '#' }
];

export const deluxeShowtimes: Showtime[] = [
    { time: '11:15', link: '#' },
    { time: '14:30', link: '#' },
    { time: '19:45', link: '#' },
    { time: '23:00', link: '#' }
];