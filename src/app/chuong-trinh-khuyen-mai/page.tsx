"use client";

import React from 'react';
import Layout2 from '@/components/layout/Layout2';
import { promotions } from '@/components/promotions/ProCard';
import Image from 'next/image';
import Link from 'next/link';

export default function PromotionsPage() {
    return (
        <Layout2>
            <div className="container mx-auto px-4 py-8">
               

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {promotions.map((promotion) => (
                        <div
                            key={promotion.id}
                            className="bg-cinestar-darkblue rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
                        >
                            <Link href={promotion.link}>
                                <div className="relative h-64">
                                    <Image
                                        src={promotion.image}
                                        alt={promotion.title}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50"></div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-lg font-bold text-white mb-2">{promotion.title}</h3>
                                    <div className="mt-4">
                                        <span className="inline-block bg-cinestar-yellow text-cinestar-darkblue font-bold px-4 py-2 rounded hover:bg-yellow-400 transition-colors">
                                            Chi tiết
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </Layout2>
    );
}