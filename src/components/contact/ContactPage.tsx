'use client';

import React from 'react';
import ContactIcon from './ContactIcon';
import ContactForm from './ContactEmail';

interface ContactPageProps {
    className?: string;
}

export default function ContactPage({ className = '' }: ContactPageProps) {
    return (
        <div className={`py-10 ${className}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Contact Form on the left */}

                    <ContactIcon />  
                    <ContactForm />

             
            </div>


        </div>
    );
}