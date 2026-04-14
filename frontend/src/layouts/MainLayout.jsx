import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar'; 
import Footer from '@/components/Footer';
import TopHeaderBar from '@/components/TopHeader';
import MiddleBar from '@/components/MiddleBar';
import ScrollToTop from '@/components/ScrollToTop'; // 1. Import the utility

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* 2. Add it here - it doesn't render UI, just executes the scroll logic */}
      <ScrollToTop /> 

      {/* The Navbar stays permanently at the top */}
      <TopHeaderBar />
      <Navbar />

      <main className="flex-1">
        {/* Everything inside the Outlet will now start at the top on route change */}
        <Outlet /> 
      </main>

      {/* The Footer stays permanently at the bottom */}
      <Footer />
    </div>
  );
}