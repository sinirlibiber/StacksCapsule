'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import CapsuleForm from '@/components/CapsuleForm';
import CapsuleList from '@/components/CapsuleList';
import HowItWorks from '@/components/HowItWorks';
import Footer from '@/components/Footer';

export default function Home() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <main className="min-h-screen">
      <Header />
      
      <Hero onCreateCapsule={() => setIsFormOpen(true)} />
      
      <CapsuleList />
      
      <HowItWorks />
      
      <Footer />
      
      <CapsuleForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
      />
    </main>
  );
}

