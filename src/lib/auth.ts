import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { query } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface User {
    id: number;
    username: string;
    email: string;
    fullName: string;
    role: 'admin' | 'user';
}

export interface AuthResult {
    success: boolean;
    user?: User;
    message?: string;
}

/**
 * Verify JWT token and get user info
 */
export async function verifyToken(token: string): Promise<AuthResult> {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        
        // Get user from database to ensure user still exists and is active
        const users = await query(
            'SELECT id_users, username, email, full_name, role FROM users WHERE id_users = ? AND status = "active"',
            [decoded.userId]
        );

        const user = Array.isArray(users) && users.length > 0 ? users[0] : null;

        if (!user) {
            return {
                success: false,
                message: 'Người dùng không tồn tại hoặc đã bị vô hiệu hóa'
            };
        }

        return {
            success: true,
            user: {
                id: user.id_users,
                username: user.username,
                email: user.email,
                fullName: user.full_name,
                role: user.role
            }
        };

    } catch (error) {
        return {
            success: false,
            message: 'Token không hợp lệ'
        };
    }
}

/**
 * Get user from request (for API routes)
 */
export async function getUserFromRequest(req: NextRequest): Promise<AuthResult> {
    // Try to get token from cookie first
    let token = req.cookies.get('auth-token')?.value;
    
    // If no cookie, try Authorization header
    if (!token) {
        const authHeader = req.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
    }

    if (!token) {
        return {
            success: false,
            message: 'Không tìm thấy token xác thực'
        };
    }

    return await verifyToken(token);
}

/**
 * Check if user has admin role
 */
export function isAdmin(user: User): boolean {
    return user.role === 'admin';
}

/**
 * Check if user has required role
 */
export function hasRole(user: User, requiredRole: 'admin' | 'user'): boolean {
    if (requiredRole === 'admin') {
        return user.role === 'admin';
    }
    return user.role === 'admin' || user.role === 'user';
}

/**
 * Middleware function to protect API routes
 */
export async function requireAuth(req: NextRequest, requiredRole?: 'admin' | 'user') {
    const authResult = await getUserFromRequest(req);
    
    if (!authResult.success || !authResult.user) {
        return {
            success: false,
            message: authResult.message || 'Unauthorized',
            status: 401
        };
    }

    if (requiredRole && !hasRole(authResult.user, requiredRole)) {
        return {
            success: false,
            message: 'Bạn không có quyền truy cập',
            status: 403
        };
    }

    return {
        success: true,
        user: authResult.user
    };
}

/**
 * Generate JWT token
 */
export function generateToken(user: { id: number; username: string; email: string; role: string }) {
    return jwt.sign(
        {
            userId: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}
