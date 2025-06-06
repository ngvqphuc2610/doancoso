import { createInstance } from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next/initReactI18next';

const initI18next = async (lng: string, ns: string) => {
    const i18nInstance = createInstance();
    await i18nInstance
        .use(initReactI18next)
        .use(resourcesToBackend((language: string, namespace: string) =>
            import(`../../../public/locales/${language}/${namespace}.json`)
        ))
        .init({
            supportedLngs: ['en', 'vi'],
            fallbackLng: 'vi',
            lng,
            ns,
            defaultNS: 'translation',
            interpolation: {
                escapeValue: false,
            },
        });
    return i18nInstance;
};

export async function getTranslation(lng: string, ns: string = 'translation') {
    const i18nextInstance = await initI18next(lng, ns);
    return {
        t: i18nextInstance.getFixedT(lng, ns),
        i18n: i18nextInstance,
    };
}