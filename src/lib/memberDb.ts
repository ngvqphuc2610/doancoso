import { Member, TypeMember } from './types/database';
import { query } from './db';

/**
 * Lấy danh sách tất cả các thành viên
 */
export async function getMembers(): Promise<Member[]> {
    try {
        const members = await query<any[]>(
            `SELECT m.*, u.full_name, u.email, u.phone_number, tm.type_name, ms.title as membership_title
             FROM member m
             JOIN users u ON m.id_user = u.id_users
             JOIN type_member tm ON m.id_typemember = tm.id_typemember
             LEFT JOIN membership ms ON m.id_membership = ms.id_membership
             WHERE m.status = 'active'
             ORDER BY m.created_at DESC`
        );

        return members.map(member => ({
            id_member: member.id_member,
            id_user: member.id_user,
            id_typemember: member.id_typemember,
            id_membership: member.id_membership,
            full_name: member.full_name,
            email: member.email,
            phone: member.phone_number,
            type_name: member.type_name,
            membership_title: member.membership_title,
            points: member.points,
            join_date: member.join_date,
            status: member.status,
            created_at: member.created_at,
            updated_at: member.updated_at
        }));
    } catch (error) {
        console.error("Lỗi khi lấy danh sách thành viên:", error);
        return [];
    }
}

/**
 * Lấy thông tin chi tiết của một thành viên theo ID
 */
export async function getMemberById(id: number): Promise<Member | null> {
    try {
        const members = await query<any[]>(
            `SELECT m.*, u.full_name, u.email, u.phone_number, tm.type_name, ms.title as membership_title
             FROM member m
             JOIN users u ON m.id_user = u.id_users
             JOIN type_member tm ON m.id_typemember = tm.id_typemember
             LEFT JOIN membership ms ON m.id_membership = ms.id_membership
             WHERE m.id_member = ?`,
            [id]
        );

        if (!members.length) return null;

        const member = members[0];
        return {
            id_member: member.id_member,
            id_user: member.id_user,
            id_typemember: member.id_typemember,
            id_membership: member.id_membership,
            full_name: member.full_name,
            email: member.email,
            phone: member.phone_number,
            type_name: member.type_name,
            membership_title: member.membership_title,
            points: member.points,
            join_date: member.join_date,
            status: member.status,
            created_at: member.created_at,
            updated_at: member.updated_at
        };
    } catch (error) {
        console.error(`Lỗi khi lấy thông tin thành viên với ID ${id}:`, error);
        return null;
    }
}

/**
 * Tạo thành viên mới
 */
export async function createMember(memberData: Partial<Member>): Promise<{success: boolean, data?: any, message?: string}> {
    try {
        // Kiểm tra user đã tồn tại
        const userExists = await query<any[]>(
            `SELECT * FROM users WHERE id_users = ?`,
            [memberData.id_user]
        );
        
        if (userExists.length === 0) {
            return {
                success: false,
                message: 'Người dùng không tồn tại'
            };
        }

        const result = await query(
            `INSERT INTO member (id_user, id_typemember, id_membership, points, join_date, status)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                memberData.id_user,
                memberData.id_typemember || 1, // Default type
                memberData.id_membership,
                memberData.points || 0,
                memberData.join_date || new Date().toISOString().slice(0, 10),
                memberData.status || 'active'
            ]
        );

        return {
            success: true,
            data: {
                id_member: (result as any).insertId,
                ...memberData
            },
            message: 'Tạo thành viên thành công'
        };
    } catch (error: any) {
        console.error('Lỗi khi tạo thành viên:', error);
        return {
            success: false,
            message: `Lỗi khi tạo thành viên: ${error.message}`
        };
    }
}

/**
 * Cập nhật thông tin thành viên
 */
export async function updateMember(id: number, memberData: Partial<Member>): Promise<{success: boolean, message: string}> {
    try {
        // Kiểm tra thành viên tồn tại
        const memberExists = await query<any[]>(
            `SELECT * FROM member WHERE id_member = ?`,
            [id]
        );
        
        if (memberExists.length === 0) {
            return {
                success: false,
                message: 'Thành viên không tồn tại'
            };
        }

        await query(
            `UPDATE member SET 
                id_typemember = ?,
                id_membership = ?,
                points = ?,
                status = ?
             WHERE id_member = ?`,
            [
                memberData.id_typemember,
                memberData.id_membership,
                memberData.points,
                memberData.status,
                id
            ]
        );

        return {
            success: true,
            message: 'Cập nhật thành viên thành công'
        };
    } catch (error: any) {
        console.error(`Lỗi khi cập nhật thành viên ID ${id}:`, error);
        return {
            success: false,
            message: `Lỗi khi cập nhật thành viên: ${error.message}`
        };
    }
}

/**
 * Xóa thành viên
 */
export async function deleteMember(id: number): Promise<{success: boolean, message: string}> {
    try {
        // Kiểm tra thành viên tồn tại
        const memberExists = await query<any[]>(
            `SELECT * FROM member WHERE id_member = ?`,
            [id]
        );
        
        if (memberExists.length === 0) {
            return {
                success: false,
                message: 'Thành viên không tồn tại'
            };
        }

        // Thay vì xóa, cập nhật trạng thái thành 'inactive'
        await query(
            `UPDATE member SET status = 'inactive' WHERE id_member = ?`,
            [id]
        );

        return {
            success: true,
            message: 'Xóa thành viên thành công'
        };
    } catch (error: any) {
        console.error(`Lỗi khi xóa thành viên ID ${id}:`, error);
        return {
            success: false,
            message: `Lỗi khi xóa thành viên: ${error.message}`
        };
    }
}

/**
 * Lấy danh sách loại thành viên
 */
export async function getMemberTypes(): Promise<TypeMember[]> {
    try {
        const types = await query<TypeMember[]>(
            `SELECT * FROM type_member ORDER BY priority`
        );
        return types;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách loại thành viên:", error);
        return [];
    }
}



