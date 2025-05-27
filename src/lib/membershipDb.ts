import { Membership } from './types/database';
import { query } from './db';

/**
 * Lấy danh sách tất cả các gói thành viên
 */
export async function getMemberships(): Promise<Membership[]> {
    try {
        const memberships = await query<Membership[]>(
            `SELECT * FROM membership ORDER BY id_membership`
        );
        return memberships;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách gói thành viên:", error);
        return [];
    }
}

/**
 * Lấy thông tin chi tiết của một gói thành viên theo ID
 */
export async function getMembershipById(id: number): Promise<Membership | null> {
    try {
        const memberships = await query<Membership[]>(
            `SELECT * FROM membership WHERE id_membership = ?`,
            [id]
        );

        if (!memberships.length) return null;
        return memberships[0];
    } catch (error) {
        console.error(`Lỗi khi lấy thông tin gói thành viên với ID ${id}:`, error);
        return null;
    }
}

/**
 * Tạo gói thành viên mới
 */
export async function createMembership(membershipData: Partial<Membership>): Promise<{success: boolean, data?: any, message?: string}> {
    try {
        // Kiểm tra code đã tồn tại chưa
        if (membershipData.code) {
            const codeExists = await query<any[]>(
                `SELECT * FROM membership WHERE code = ?`,
                [membershipData.code]
            );
            
            if (codeExists.length > 0) {
                return {
                    success: false,
                    message: 'Mã gói thành viên đã tồn tại'
                };
            }
        }

        const result = await query(
            `INSERT INTO membership (code, title, image, link, description, benefits, criteria, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                membershipData.code,
                membershipData.title,
                membershipData.image,
                membershipData.link,
                membershipData.description,
                membershipData.benefits,
                membershipData.criteria,
                membershipData.status || 'active'
            ]
        );

        return {
            success: true,
            data: {
                id_membership: (result as any).insertId,
                ...membershipData
            },
            message: 'Tạo gói thành viên thành công'
        };
    } catch (error: any) {
        console.error('Lỗi khi tạo gói thành viên:', error);
        return {
            success: false,
            message: `Lỗi khi tạo gói thành viên: ${error.message}`
        };
    }
}

/**
 * Cập nhật thông tin gói thành viên
 */
export async function updateMembership(id: number, membershipData: Partial<Membership>): Promise<{success: boolean, message: string}> {
    try {
        // Kiểm tra gói thành viên tồn tại
        const membershipExists = await query<any[]>(
            `SELECT * FROM membership WHERE id_membership = ?`,
            [id]
        );
        
        if (membershipExists.length === 0) {
            return {
                success: false,
                message: 'Gói thành viên không tồn tại'
            };
        }

        // Kiểm tra code đã tồn tại chưa (nếu có thay đổi)
        if (membershipData.code && membershipData.code !== membershipExists[0].code) {
            const codeExists = await query<any[]>(
                `SELECT * FROM membership WHERE code = ? AND id_membership != ?`,
                [membershipData.code, id]
            );
            
            if (codeExists.length > 0) {
                return {
                    success: false,
                    message: 'Mã gói thành viên đã tồn tại'
                };
            }
        }

        await query(
            `UPDATE membership SET 
                code = ?,
                title = ?,
                image = ?,
                link = ?,
                description = ?,
                benefits = ?,
                criteria = ?,
                status = ?
             WHERE id_membership = ?`,
            [
                membershipData.code,
                membershipData.title,
                membershipData.image,
                membershipData.link,
                membershipData.description,
                membershipData.benefits,
                membershipData.criteria,
                membershipData.status,
                id
            ]
        );

        return {
            success: true,
            message: 'Cập nhật gói thành viên thành công'
        };
    } catch (error: any) {
        console.error(`Lỗi khi cập nhật gói thành viên ID ${id}:`, error);
        return {
            success: false,
            message: `Lỗi khi cập nhật gói thành viên: ${error.message}`
        };
    }
}

/**
 * Xóa gói thành viên
 */
export async function deleteMembership(id: number): Promise<{success: boolean, message: string}> {
    try {
        // Kiểm tra gói thành viên tồn tại
        const membershipExists = await query<any[]>(
            `SELECT * FROM membership WHERE id_membership = ?`,
            [id]
        );
        
        if (membershipExists.length === 0) {
            return {
                success: false,
                message: 'Gói thành viên không tồn tại'
            };
        }

        // Kiểm tra có thành viên nào đang sử dụng gói này không
        const memberUsing = await query<any[]>(
            `SELECT * FROM member WHERE id_membership = ?`,
            [id]
        );
        
        if (memberUsing.length > 0) {
            return {
                success: false,
                message: 'Không thể xóa gói thành viên đang được sử dụng'
            };
        }

        // Thay vì xóa, cập nhật trạng thái thành 'inactive'
        await query(
            `UPDATE membership SET status = 'inactive' WHERE id_membership = ?`,
            [id]
        );

        return {
            success: true,
            message: 'Xóa gói thành viên thành công'
        };
    } catch (error: any) {
        console.error(`Lỗi khi xóa gói thành viên ID ${id}:`, error);
        return {
            success: false,
            message: `Lỗi khi xóa gói thành viên: ${error.message}`
        };
    }
}

