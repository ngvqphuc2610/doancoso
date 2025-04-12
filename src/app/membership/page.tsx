"use client";

import Layout from '@/components/layout/Layout';
import { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import MemberCardCarousel from '@/components/member/MemberCardCarousel';
// Fix: Correct image imports - no need for @/public prefix



export default function Home() {



  return (
    <Layout>
      


      <div className="container mx-auto px-4 ">
       


            

            <MemberCardCarousel className="" />
        

      </div>
    </Layout>
  );
}
