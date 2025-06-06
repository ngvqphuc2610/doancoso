'use client';

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';

i18next
    .use(initReactI18next)
    .use(LanguageDetector)
    .use(resourcesToBackend((language: string, namespace: string) =>
        import(`../../../public/locales/${language}/${namespace}.json`)
    ))
    .init({
        fallbackLng: 'vi',
        lng: 'vi',
        supportedLngs: ['en', 'vi'],
        ns: ['translation'],
        defaultNS: 'translation',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18next;