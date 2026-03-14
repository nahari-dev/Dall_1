'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  const router = useRouter();
  return (
    <section className="bg-teal-light py-16 lg:py-20 px-6 lg:px-14">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 text-right">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold font-arabic text-navy mb-2">
            هذا هو الوقت — اجتز SDLE الآن
          </h2>
          <p className="text-lg text-gray font-arabic">
            7 أيام مجانية بدون التزام. ابدأ دراستك اليوم.
          </p>
        </div>

        <div className="flex gap-4 flex-shrink-0 w-full lg:w-auto">
          <button onClick={() => router.push('/chat')} className="flex-1 lg:flex-none bg-navy text-white font-bold py-3 px-6 rounded-lg hover:bg-teal transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 font-arabic">
            ابدأ الآن مجانًا
            <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={() => { const el = document.getElementById('pricing'); el?.scrollIntoView({ behavior: 'smooth' }); }} className="flex-1 lg:flex-none border-2 border-navy text-navy font-bold py-3 px-6 rounded-lg hover:bg-navy hover:text-white transition-all font-arabic">
            تعرّف على المزيد
          </button>
        </div>
      </div>
    </section>
  );
}
