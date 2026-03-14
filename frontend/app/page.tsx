'use client';

import HeroSection from '@/components/landing/HeroSection';
import StatsSection from '@/components/landing/StatsSection';

import FeaturesSection from '@/components/landing/FeaturesSection';
import PricingSection from '@/components/landing/PricingSection';
import CTASection from '@/components/landing/CTASection';

export default function Home() {
  return (
    <main className="min-h-screen bg-off-white overflow-hidden" dir="rtl">
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <PricingSection />
      <CTASection />
    </main>
  );
}
