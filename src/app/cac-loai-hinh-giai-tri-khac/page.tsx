import React from "react";
import Layout from "@/components/layout/Layout";
import TaimentGrid from "@/components/taiment/TaimentGrid";
export default function CacLoaiHinhGiaTriKhacPage() {
    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                
                <TaimentGrid />
            </div>
        </Layout>
    );
}