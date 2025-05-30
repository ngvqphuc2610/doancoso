// Legacy member data for backward compatibility
export interface MemberProps {
  id: string;
  title: string;
  image: string;
  link: string;
  description: string;
}

export const memberItems: MemberProps[] = [
  {
    id: "1",
    title: "THÀNH VIÊN ĐỒNG",
    image: "/images/membership-bronze.jpg",
    link: "/membership",
    description: "Gói thành viên cơ bản với nhiều ưu đãi hấp dẫn"
  },
  {
    id: "2", 
    title: "THÀNH VIÊN BẠC",
    image: "/images/membership-silver.jpg",
    link: "/membership",
    description: "Gói thành viên nâng cao với nhiều quyền lợi đặc biệt"
  }
];
