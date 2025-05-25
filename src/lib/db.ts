"use server";

import { db } from '../config/db.ts';
import { QueryResultHeader } from './types/database';

/**
 * Generic type for database query results
 * T: The expected return type (e.g., Movie[], Product, etc.)
 */
export type QueryResult<T = any> = T;

/**
 * Helper function for database queries with retry logic for better reliability
 * 
 * @template T - The expected return type of the query
 * @param {string} sql - The SQL query to execute
 * @param {any[]} [params] - Optional parameters for the prepared statement
 * @param {number} [retries=2] - Number of retry attempts on connection failure
 * @returns {Promise<T>} - The query results with the specified type
 */
export async function query<T = any>(sql: string, params?: any[], retries = 2): Promise<T> {
    try {
        const [results] = await db.execute(sql, params);
        return results as T;
    } catch (error: any) {
        // Nếu lỗi là do mất kết nối và còn lần retry
        if ((error.code === 'PROTOCOL_CONNECTION_LOST' ||
            error.code === 'ECONNREFUSED' ||
            error.code === 'ETIMEDOUT') && retries > 0) {
            console.log(`Kết nối database bị mất. Thử kết nối lại... (còn ${retries} lần thử)`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return query<T>(sql, params, retries - 1);
        }

        console.error('Database error:', error);
        console.error('Query:', sql);
        console.error('Params:', params);
        throw error;
    }
}

/**
 * Execute transactions without using prepared statements
 * 
 * @template T - The expected return type of the transaction
 * @param {string} sql - The SQL statement to execute
 * @param {number} [retries=2] - Number of retry attempts on connection failure
 * @returns {Promise<T>} - The transaction results with the specified type
 */
export async function executeTransaction<T = any>(sql: string, retries = 2): Promise<T> {
    try {
        // Sử dụng query() thay vì execute() để tránh dùng prepared statements
        const [results] = await db.query(sql);
        return results as T;
    } catch (error: any) {
        // Nếu lỗi là do mất kết nối và còn lần retry
        if ((error.code === 'PROTOCOL_CONNECTION_LOST' ||
            error.code === 'ECONNREFUSED' ||
            error.code === 'ETIMEDOUT') && retries > 0) {
            console.log(`Kết nối database bị mất. Thử kết nối lại... (còn ${retries} lần thử)`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return executeTransaction<T>(sql, retries - 1);
        }

        console.error('Transaction error:', error);
        console.error('SQL:', sql);
        throw error;
    }
}