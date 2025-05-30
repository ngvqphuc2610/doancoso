import { Membership } from '@/lib/types/database';

export interface MembershipCardProps {
    id: string;
    title: string;
    image: string;
    description?: string;
    benefits?: string;
    criteria?: string;
    code?: string;
    link?: string;
}

// Function to convert database membership to MembershipCardProps
function convertDbMembershipToProps(membership: Membership): MembershipCardProps {
    return {
        id: membership.id_membership.toString(),
        title: membership.title,
        image: membership.image || '/images/membership-default.jpg',
        description: membership.description || '',
        benefits: membership.benefits || '',
        criteria: membership.criteria || '',
        code: membership.code,
        link: membership.link
    };
}

// Get all memberships from database
export async function getAllMemberships(): Promise<MembershipCardProps[]> {
    try {
        const response = await fetch('/api/membership');
        const data = await response.json();
        
        if (data.success && data.data) {
            return data.data.map(convertDbMembershipToProps);
        }
        return fallbackMembershipItems;
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu membership:", error);
        return fallbackMembershipItems;
    }
}

// Get membership by ID from database
export async function getMembershipById(id: string): Promise<MembershipCardProps | null> {
    try {
        const response = await fetch(`/api/membership/${id}`);
        const data = await response.json();
        
        if (data.success && data.data) {
            return convertDbMembershipToProps(data.data);
        }
        return null;
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu membership:", error);
        return null;
    }
}

// Fallback membership data for error cases
export const fallbackMembershipItems: MembershipCardProps[] = [
    {
        id: '1',
        title: 'THÀNH VIÊN ĐỒNG',
        image: '/images/membership-bronze.jpg',
        description: 'Gói thành viên cơ bản với nhiều ưu đãi hấp dẫn',
        benefits: 'Giảm giá 5% cho vé xem phim, Tích điểm mỗi lần mua vé, Ưu tiên đặt vé trước',
        criteria: 'Đăng ký miễn phí, Không yêu cầu chi tiêu tối thiểu',
        code: 'BRONZE'
    },
    {
        id: '2',
        title: 'THÀNH VIÊN BạC',
        image: '/images/membership-silver.jpg',
        description: 'Gói thành viên nâng cao với nhiều quyền lợi đặc biệt',
        benefits: 'Giảm giá 10% cho vé xem phim, Tích điểm x2, Miễn phí nước uống, Ưu tiên ghế VIP',
        criteria: 'Chi tiêu tối thiểu 500.000 VNĐ/tháng, Thành viên ít nhất 3 tháng',
        code: 'SILVER'
    },
    {
        id: '3',
        title: 'THÀNH VIÊN VÀNG',
        image: '/images/membership-gold.jpg',
        description: 'Gói thành viên cao cấp với đặc quyền tối ưu',
        benefits: 'Giảm giá 15% cho vé xem phim, Tích điểm x3, Miễn phí combo, Phòng chờ VIP, Ưu tiên suất chiếu sớm',
        criteria: 'Chi tiêu tối thiểu 1.000.000 VNĐ/tháng, Thành viên ít nhất 6 tháng',
        code: 'GOLD'
    }
];

// Export for backward compatibility
export const membershipItems = fallbackMembershipItems;
