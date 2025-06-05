/**
 * Timezone utilities for handling Vietnam timezone (UTC+7)
 * This file provides functions to ensure consistent timezone handling
 * across the application, especially for date/time operations.
 */

// Constants
export const VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh'; // UTC+7
export const VIETNAM_TIMEZONE_OFFSET = '+07:00';

/**
 * Sets the process timezone to Vietnam
 * Call this at application startup
 */
export function setVietnamTimeZone() {
    process.env.TZ = VIETNAM_TIMEZONE;
}

/**
 * Converts any date to Vietnam timezone
 * @param date - Date object or date string
 * @returns Date object normalized to Vietnam time
 */
export function toVietnamTime(date: Date | string): Date {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Date(d.toLocaleString('en-US', { timeZone: VIETNAM_TIMEZONE }));
}

/**
 * Get current date in Vietnam timezone (YYYY-MM-DD)
 * @returns string representing today's date in Vietnam
 */
export function getCurrentVietnamDate(): string {
    return toVietnamTime(new Date()).toISOString().split('T')[0];
}

/**
 * Get current time in Vietnam timezone (HH:MM:SS)
 * @returns string representing current time in Vietnam
 */
export function getCurrentVietnamTime(): string {
    return toVietnamTime(new Date()).toTimeString().split(' ')[0];
}

/**
 * Get both date and time in Vietnam timezone
 * @returns object with date (YYYY-MM-DD) and time (HH:MM:SS)
 */
export function getCurrentVietnamDateTime() {
    const now = toVietnamTime(new Date());
    return {
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().split(' ')[0],
        full: now.toISOString()
    };
}

/**
 * Formats date to YYYY-MM-DD
 * @param date - The date to format
 * @returns formatted date string
 */
export function formatToYYYYMMDD(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
}

/**
 * Formats date to DD/MM/YYYY (Vietnamese format)
 * @param date - The date to format
 * @returns formatted date string
 */
export function formatToDDMMYYYY(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

/**
 * Formats time to HH:MM
 * @param timeStr - Time string in format HH:MM:SS
 * @returns formatted time string (HH:MM)
 */
export function formatTime(timeStr: string): string {
    return timeStr ? timeStr.slice(0, 5) : '';
}

/**
 * Checks if a date is today in Vietnam timezone
 * @param date - The date to check
 * @returns boolean indicating if date is today
 */
export function isToday(date: Date | string): boolean {
    const todayVN = getCurrentVietnamDate();
    const checkDate = formatToYYYYMMDD(date);
    return todayVN === checkDate;
}

/**
 * Checks if a datetime has passed (is in the past)
 * @param date - Date string (YYYY-MM-DD)
 * @param time - Time string (HH:MM:SS)
 * @returns boolean indicating if the datetime is in the past
 */
export function isDateTimePast(date: string, time: string): boolean {
    // Lấy thời gian hiện tại theo múi giờ Vietnam
    const now = toVietnamTime(new Date());

    // Tạo đối tượng Date từ date và time, rồi chuyển sang múi giờ Vietnam
    const dateTimeStr = `${date}T${time}`;
    const checkDate = toVietnamTime(new Date(dateTimeStr));

    // Log để debug
    console.log('🕒 Time comparison:', {
        now: now.toISOString(),
        showtime: checkDate.toISOString(),
        isPast: checkDate <= now,
        date,
        time
    });

    return checkDate <= now;
}

/**
 * Adds minutes to a date and returns the new date
 * @param date - The original date
 * @param minutes - Number of minutes to add
 * @returns New date with minutes added
 */
export function addMinutes(date: Date | string, minutes: number): Date {
    const d = typeof date === 'string' ? new Date(date) : new Date(date.getTime());
    d.setMinutes(d.getMinutes() + minutes);
    return d;
}

/**
 * Gets the name of the day of week in Vietnamese
 * @param date - The date to get day name for
 * @returns Vietnamese day name
 */
export function getVietnameseDayName(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const dayOfWeek = d.getDay();
    const vnDayNames = [
        'Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư',
        'Thứ năm', 'Thứ sáu', 'Thứ bảy'
    ];
    return vnDayNames[dayOfWeek];
}

/**
 * Checks if the MySQL timezone is correctly set
 * Used for debugging timezone issues
 * @returns log message about timezone settings
 */
export function checkTimezones() {
    const jsTime = new Date().toISOString();
    const vnTime = toVietnamTime(new Date()).toISOString();

    console.log('🕒 Timezone debug info:');
    console.log(`- JS UTC time: ${jsTime}`);
    console.log(`- Vietnam time: ${vnTime}`);
    console.log(`- Process.env.TZ: ${process.env.TZ}`);

    return {
        jsTime,
        vnTime,
        processTimezone: process.env.TZ
    };
}