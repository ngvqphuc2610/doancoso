'use client';

import { I18nextProvider } from 'react-i18next';
import { ReactNode, useEffect, useState } from 'react';
import i18next from './client';

export default function Provider({ children }: { children: ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <I18nextProvider i18n={i18next}>
            {children}
        </I18nextProvider>
    );
}