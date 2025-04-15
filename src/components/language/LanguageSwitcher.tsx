'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FaCaretDown } from "react-icons/fa";
import { useLanguage } from '../providers/LanguageProvider';
import { useTranslation } from 'react-i18next';

interface LanguageSwitcherProps {
    className?: string;
}

export default function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
    const { currentLanguage, changeLanguage } = useLanguage();
    const { t } = useTranslation();
    const [isHovered, setIsHovered] = useState(false);

    const handleLanguageChange = (lang: 'vi' | 'en') => {
        changeLanguage(lang);
    };

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <button
                className={`flex items-center gap-1 cursor-pointer ${className}`}
            >
                <Image
                    src={currentLanguage === 'vi' ? "/images/header-vietnam.svg" : "/images/america.webp"}
                    alt={currentLanguage === 'vi' ? "Vietnam" : "English"}
                    width={20}
                    height={20}
                />
                <span className="inline-block">{t('header.language')}</span>
                <FaCaretDown className="inline-block" />
            </button>

            {isHovered && (
                <div className="absolute top-full left- mt-0 bg-[#3366CCCC] shadow-lg rounded-md overflow-hidden">
                    {currentLanguage === 'en' && (
                        <button
                            className="w-full px-6 py-3 text-left  flex items-center gap-2"
                            onClick={() => handleLanguageChange('vi')}
                        >
                            <Image
                                src="/images/header-vietnam.svg"
                                alt="Vietnam"
                                width={20}
                                height={20}
                            />
                            <span>VN</span>
                        </button>
                    )}
                    {currentLanguage === 'vi' && (
                        <button
                            className="w-full px-6 py-3 text-left  flex items-center gap-2"
                            onClick={() => handleLanguageChange('en')}
                        >
                            <Image
                                src="/images/america.webp"
                                alt="English"
                                width={20}
                                height={20}
                            />
                            <span>ENG</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}