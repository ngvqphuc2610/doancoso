"use server";

import pool from '../config/db.js';

// Helper function for database queries với retry logic cho độ tin cậy cao hơn
export async function query(sql: string, params?: any[], retries = 2) {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error: any) {
        // Nếu lỗi là do mất kết nối và còn lần retry
        if ((error.code === 'PROTOCOL_CONNECTION_LOST' ||
            error.code === 'ECONNREFUSED' ||
            error.code === 'ETIMEDOUT') && retries > 0) {
            console.log(`Kết nối database bị mất. Thử kết nối lại... (còn ${retries} lần thử)`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return query(sql, params, retries - 1);
        }

        console.error('Database error:', error);
        console.error('Query:', sql);
        console.error('Params:', params);
        throw error;
    }
}

// Hàm mới để thực thi các lệnh giao dịch không dùng prepared statements
export async function executeTransaction(sql: string, retries = 2) {
    try {
        // Sử dụng query() thay vì execute() để tránh dùng prepared statements
        const [results] = await pool.query(sql);
        return results;
    } catch (error: any) {
        // Nếu lỗi là do mất kết nối và còn lần retry
        if ((error.code === 'PROTOCOL_CONNECTION_LOST' ||
            error.code === 'ECONNREFUSED' ||
            error.code === 'ETIMEDOUT') && retries > 0) {
            console.log(`Kết nối database bị mất. Thử kết nối lại... (còn ${retries} lần thử)`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return executeTransaction(sql, retries - 1);
        }

        console.error('Transaction error:', error);
        console.error('SQL:', sql);
        throw error;
    }
}