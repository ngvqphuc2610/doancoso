import React from 'react';
import Layout from '@/components/layout/Layout';
import ContactPage from '@/components/contact/ContactPage';

export const metadata = {
    title: 'Liên hệ | Cinestar',
    description: 'Liên hệ với Cinestar để được hỗ trợ hoặc giải đáp thắc mắc',
};

export default function Contact() {
    return (
        <Layout>
            <div className="container mx-auto px-4">
                <ContactPage />
            </div>
        </Layout>
    );
}