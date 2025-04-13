'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface ContactIconProps {
    className?: string;
}

const handleZaloChat = () => {
    const phoneNumber = process.env.NEXT_PUBLIC_NUMBER_PHONE; // Use NEXT_PUBLIC_ prefix for client-side access
    window.open(`https://zalo.me/${phoneNumber}`, "_blank"); // Open Zalo chatbox
};

export default function ContactIcon({ className = '' }: ContactIconProps) {
    const { t } = useTranslation();

    return (
        <div className={`space-y-6 ${className}`}>
            <h1 className=" text-4xl font-bold text-white text-center mb-8">{t('contact.title')}</h1>
            <div className='flex justify-center items-center flex-col'>
                <Link href="https://www.facebook.com/cinestarcinemasvietnam/" target="_blank" rel="noopener noreferrer">
                    <Button
                        variant="custom4"
                        width="custom4"
                        size="lg"
                        className=" relative mb-5 group contact-button  hover:bg-blue-700 transition-all duration-300"
                    >
                        <div className="flex items-center justify-between w-full">
                            <div className="relative w-[143px] h-[153px]">
                                <Image
                                    src="/images/contact-fb.webp"
                                    alt="Facebook"
                                    width={120}
                                    height={120}
                                    className="absolute -left-2 -top-1 transform rotate-12 group-hover:rotate-0 transition-transform duration-300"
                                />
                            </div>
                            <span className="text-2xl font-bold tracking-wider">FACEBOOK</span>
                        </div>
                    </Button>
                </Link>

                <Link href="https://zalo.me/1234567890" target="_blank" rel="noopener noreferrer">
                    <Button
                        variant="custom4"
                        width="custom4"
                        size="lg"
                        className="relative mb-5 group contact-button  hover:bg-blue-700 transition-all duration-300"
                        onClick={handleZaloChat}
                    >
                        <span className="text-2xl font-bold tracking-wider">ZALO CHAT</span>
                        <div className="relative w-[120px] h-[120px] ml-4">
                            <Image
                                src="/images/contact-zalo.webp"
                                alt="Zalo"
                                width={120}
                                height={120}
                                className="transform -rotate-12 group-hover:rotate-0 transition-transform duration-300"
                            />
                        </div>
                    </Button>
                </Link>
            </div>
        </div>
    );
}