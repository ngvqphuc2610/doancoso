// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from '../public/locales/en/translation.json';
import translationVI from '../public/locales/vi/translation.json';

i18n
    .use(LanguageDetector) // Tự động phát hiện ngôn ngữ trình duyệt
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: translationEN,
            },
            vi: {
                translation: translationVI,
            },
        },
        fallbackLng: 'vi',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
