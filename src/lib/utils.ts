import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function createMovieSlug(title: string, id: string) {
  return `${title
    .toLowerCase()
    .normalize('NFD') // Chuẩn hóa Unicode (chuyển dấu thành không dấu)
    .replace(/[\u0300-\u036f]/g, '') // Xóa các dấu
    .replace(/[^\w\s-]/g, '') // Xóa ký tự đặc biệt
    .replace(/\s+/g, '-') // Thay khoảng trắng bằng dấu gạch ngang
    .replace(/-+/g, '-') // Xóa nhiều dấu gạch ngang liên tiếp
    .trim()}-${id}`;
}
