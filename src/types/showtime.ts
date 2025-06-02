export interface ShowTime {
    id: number;
    time: string;
    endTime: string;
    date: string;
    room: string;
    roomType: string;
    format: string;
    price: number;
    available_seats: number;
    total_seats: number;
}

export interface Cinema {
    id: number;
    name: string;
    address: string;
    showTimes: ShowTime[];
}

export interface CinemaData {
    id_cinema: number;
    cinema_name: string;
    address: string;
    city: string;
    description?: string;
    image?: string;
    contact_number?: string;
    email?: string;
    status: string;
}

export interface ShowtimeData {
    date: string;
    cinemas: Cinema[];
}

export interface MovieShowtimesProps {
    movieId: string | number;
    status?: string;
    releaseDate?: string;
    movieTitle?: string;
    moviePoster?: string;
    queryParams?: { [key: string]: string | string[] | undefined };
}

export interface TicketSelection {
    [key: number]: number;
}

export interface ProductSelection {
    [key: string]: number;
}

export interface ProductPrices {
    [key: string]: number;
}
