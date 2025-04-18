import React from "react";
import Layout from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
export default function AboutUsPage() {
    return (
        <Layout>
            <div
                className="flex justify-center items-center min-h-screen bg-cover bg-center  "
                style={{ backgroundImage: 'url("/images/aboutus-bg.jpg")' }}
            >
                <div className="flex text-center flex-col bg-black bg-opacity-50 p-8 rounded-lg shadow-lg ">
                    <h1 className="text-2xl font-bold text-white mb-4">HỆ THỐNG CỤM RẠP TRÊN TOÀN QUỐC</h1>
                    <span className="text-white ">
                        Cinestar là một trong những hệ thống rạp chiếu phim được yêu thích nhất tại Việt Nam, cung cấp nhiều mô hình <br />
                        giải trí hấp dẫn bao gồm Các Cụm Rạp Chiếu Phim hiện đại, Nhà hát, Khu vui chơi trẻ em Kidzone, Bowling,<br />
                        Billiards, Games, Phòng Gym, Nhà Hàng, và Phố Bia C'Beer. Với mục tiêu trở thành điểm đến giải trí cho mọi gia<br />
                        đình Việt Nam, Cinestar đang được biết đến là cụm rạp ủng hộ phim Việt, góp phần phát triển điện ảnh Việt.<br />
                        Không chỉ chiếu các bộ phim bom tấn quốc tế, Cinestar còn đồng hành cùng các nhà làm phim Việt Nam, đưa
                        những tác phẩm điện ảnh đặc sắc của Việt Nam đến gần hơn với khán giả.
                    </span>
                </div>
            </div>
            <div className="bg-cinestar-darkblue pb-12">
                <h1 className="font-bold text-center">SỨ MỆNH</h1>
                <Card className=" p-4 rounded-lg shadow-md bg-cinestar-darkblue ">
                <div className="grid grid-cols-3 gap-4 ">
                    <div className="bg-blue-700 p-4 text-center rounded shadow">01</div>
                    <div className="bg-blue-700 p-4 text-center rounded shadow">02</div>
                    <div className="bg-blue-700 p-4 text-center rounded shadow">03</div>
                </div>
                </Card>
            </div>
            {/* images */}
            <div className="bg-cinestar-darkblue">
                <h1 className="font-bold text-center">chỗ này để hình</h1>
                <Card className=" p-4 rounded-lg shadow-md bg-cinestar-darkblue ">
                <div className="grid grid-cols-3 gap-4 ">
                    <div className="bg-blue-700 p-4 text-center rounded shadow">01</div>
                    <div className="bg-blue-700 p-4 text-center rounded shadow">02</div>
                    <div className="bg-blue-700 p-4 text-center rounded shadow">03</div>
                </div>
                </Card>
            </div>
        </Layout>
    );
}