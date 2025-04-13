'use client';

import React from 'react';
import ContactIcon from './ContactIcon';
import ContactForm from './ContactEmail';
import { useTranslation } from 'react-i18next';

interface ContactPageProps {
    className?: string;
}

export default function ContactPage({ className = '' }: ContactPageProps) {
    const { t } = useTranslation();

    return (
        <div className={`py-10 ${className}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ContactIcon />
                <ContactForm />
            </div>
        </div>
    );
}