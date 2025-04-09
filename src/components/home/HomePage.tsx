import React from 'react';
import HeroBanner from './HeroBanner';
import banner from '@/public/images/banner.png'; // import ảnh
import banner2 from '@/public/images/banner2.jpg'; // import ảnh

const HomePage: React.FC = () => {
    const banners = [
        { id: '1', image: banner, title: 'Banner 1', link: '/movie1' }, // sử dụng StaticImageData
        { id: '2', image: banner2, title: 'Banner 2', link: '/movie2' }, // sử dụng StaticImageData
        { id: '3', image: banner, title: 'Banner 3', link: '/movie3' }, // sử dụng StaticImageData
    ];

    return (
        <div>
            <HeroBanner banners={banners} />
            {/* Other components of the page */}
        </div>
    );
};

export default HomePage;
