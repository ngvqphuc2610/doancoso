'use client';

import { use } from 'react';
import Layout from '@/components/layout/Layout';
import CheckoutContainer from '@/components/checkout/CheckoutContainer';

interface CheckoutPageProps {
    params: {};
    searchParams: Promise<{
        showtime: string;
        cinemaName: string;
        screenName: string;
        totalPrice?: string;
        seats?: string;
        movieTitle?: string;
        [key: string]: string | undefined;
    }>;
}

export default function CheckoutPage({ searchParams }: CheckoutPageProps) {
    // Unwrap searchParams using React.use()
    const params = use(searchParams);

    return (
        <Layout>
            <CheckoutContainer searchParams={params} />
        </Layout>
    );
}
