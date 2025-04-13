'use client';

import React, { createContext, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageContextType {
    currentLanguage: string;
    changeLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType>({
    currentLanguage: 'vi',
    changeLanguage: () => { },
});

export function useLanguage() {
    return useContext(LanguageContext);
}

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
    const { i18n } = useTranslation();
    const [currentLanguage, setCurrentLanguage] = useState('vi');

    const changeLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
        setCurrentLanguage(lang);
        localStorage.setItem('language', lang);
    };

    React.useEffect(() => {
        const savedLanguage = localStorage.getItem('language') || 'vi';
        changeLanguage(savedLanguage);
    }, []);

    return (
        <LanguageContext.Provider value={{ currentLanguage, changeLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}