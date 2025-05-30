import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';


// Interface cho membership từ database
export interface MembershipProps {
    id: string;
    title: string;
    image?: string;
    description?: string;
    benefits?: string;
    criteria?: string;
    code?: string;
    link?: string;
    onMembershipPage?: boolean;
}

// Legacy interface để tương thích ngược
export interface MemberProps {
    id: string;
    title: string;
    image: string;
    link: string;
    description: string;
}

// Component mới cho Membership từ database
export function MembershipCard({
    id,
    title,
    image,
    description,
    benefits,
    criteria,
    code,
    link,
    onMembershipPage = false // Mặc định là false
}: MembershipProps) {
    const { t } = useTranslation();

    // Xác định translation key dựa vào id
    const getMemberTranslation = (memberId: string) => {
        switch (memberId) {
            case "1":
                return {
                    name: "member.name",
                    description: "member.description"
                };
            case "2":
                return {
                    name: "member.name2",
                    description: "member.description2"
                };
            default:
                return {
                    name: "member.name",
                    description: "member.description"
                };
        }
    };

    const translationKeys = getMemberTranslation(id);

    // Tạo URL động dựa trên trang hiện tại
    const href = link || (onMembershipPage ? '/movie' : '/membership');

    // Parse benefits và criteria thành array
    const benefitsList = benefits ? benefits.split(',').map(b => b.trim()) : [];
    const criteriaList = criteria ? criteria.split(',').map(c => c.trim()) : [];

    // Xác định màu theme dựa trên title
    const getThemeColor = () => {
        const titleLower = title?.toLowerCase() || '';
        if (titleLower.includes('đồng') || titleLower.includes('bronze')) {
            return '#b87333'; // Bronze color
        } else if (titleLower.includes('bạc') || titleLower.includes('silver')) {
            return '#C0C0C0'; // Silver color
        } else if (titleLower.includes('vàng') || titleLower.includes('gold')) {
            return '#ebdb40'; // Gold color
        } else if (titleLower.includes('kim cương') || titleLower.includes('diamond')) {
            return '#b9f2ff'; // Diamond color
        }
        return '#ebdb40'; // Default gold
    };

    return (
        <Card className="relative bg-transparent border-none rounded-lg overflow-hidden shadow-lg hover:cursor-pointer w-full">
            <Link href={href}>
                <CardContent className="p-0 bg-transparent">
                    {/* Image Section - Đã loại bỏ chiều rộng cố định, thêm w-full */}
                    <div className="relative w-full h-[319px]"
                        style={{ boxShadow: `0 0 30px ${getThemeColor()}` }}>
                        <Image
                            src={image || '/images/no-image.jpg'}
                            alt={title}
                            className="object-fill rounded-xl"
                            fill
                        />

                        {/* Badge code */}
                        {code && (
                            <div className="absolute top-4 right-4 bg-white bg-opacity-90 px-3 py-1 rounded-full">
                                <span className="text-sm font-bold text-gray-800">{code}</span>
                            </div>
                        )}
                    </div>

                    {/* Content Section */}
                    <div className="p-4 text-white flex flex-col bg-transparent">
                        {/* Title */}
                        <h3 className="text-lg font-bold text-left">{t(translationKeys.name) || title}</h3>

                        {/* Description */}
                        <p className="text-sm mt-2 text-left">{t(translationKeys.description) || description}</p>

                        {/* Button */}
                        <Button
                            variant="custom7"
                            size="custom7"
                            width="custom7"
                            className="md:text-base mt-4"
                        >
                            {t("member.button")}
                        </Button>
                    </div>
                </CardContent>
            </Link>
        </Card>
    );
}

// Legacy component để tương thích ngược
export default function MemberCard({ id, title, image, link, description }: MemberProps) {
    const { t } = useTranslation();

    // Xác định translation key dựa vào id
    const getMemberTranslation = (memberId: string) => {
        switch (memberId) {
            case "1":
                return {
                    name: "member.name",
                    description: "member.description"
                };
            case "2":
                return {
                    name: "member.name2",
                    description: "member.description2"
                };
            default:
                return {
                    name: "member.name",
                    description: "member.description"
                };
        }
    };

    const translationKeys = getMemberTranslation(id);

    return (
        <Card className="relative bg-transparent border-none rounded-lg overflow-hidden shadow-lg hover:cursor-pointer">
            <Link href="/membership">
                <CardContent className="p-0 bg-transparent">
                    {/* Image Section */}
                    <div className="relative w-[586px] h-[319px] shadow-[0_0_30px_#ebdb40]">
                        <Image
                            src={image}
                            alt={title}
                            className="object-fill rounded-xl"
                            fill
                        />
                    </div>

                    {/* Content Section */}
                    <div className="p-4 text-white flex flex-col bg-transparent">
                        {/* Title */}
                        <h3 className="text-lg font-bold text-left">{t(translationKeys.name)}</h3>

                        {/* Description */}
                        <p className="text-sm mt-2 text-left">{t(translationKeys.description)}</p>

                        {/* Button */}
                        <Button
                            variant="custom7"
                            size="custom7"
                            width="custom7"
                            className="md:text-base"
                        >
                            {t("member.button")}
                        </Button>
                    </div>
                </CardContent>
            </Link>
        </Card>
    );
}