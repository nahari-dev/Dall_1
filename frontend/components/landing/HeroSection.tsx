'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Play } from 'lucide-react';

export default function HeroSection() {
  const router = useRouter();
  return (
    <section className="min-h-screen grid grid-cols-1 lg:grid-cols-2 items-center px-6 lg:px-14 py-20 lg:py-24 gap-12 lg:gap-16 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute w-96 h-96 rounded-full bg-gradient-to-b from-teal/10 to-transparent -right-48 top-1/2 -translate-y-1/2"></div>
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(74,143,163,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(74,143,163,.035) 1px,transparent 1px)',
            backgroundSize: '52px 52px'
          }}
        ></div>
      </div>

      {/* Text Section */}
      <div className="relative z-10 space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-teal-light px-4 py-2 rounded-full border border-teal/30 w-fit animate-fade-up">
          <div className="w-2 h-2 rounded-full bg-teal animate-pulse"></div>
          <span className="text-sm font-semibold text-teal">🚀 منصة SDLE الأولى في السعودية</span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold font-display text-navy leading-tight animate-fade-up" style={{ animationDelay: '0.1s' }}>
          أحمِ <span className="text-teal">أحلامك</span>
          <br />
          <span className="text-navy-mid">اجتز SDLE</span>
        </h1>

        {/* Description */}
        <p className="text-lg text-gray leading-relaxed max-w-md animate-fade-up" style={{ animationDelay: '0.2s' }}>
          منصة تعليمية موثوقة 100% موثقة بالمراجع الأصلية. تحضير شامل يغطي كل جانب من البلوبرينت الرسمي مع أسئلة محاكاة واقعية وتحليلات متقدمة.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <button onClick={() => router.push('/chat')} className="bg-navy text-white font-bold py-3 px-6 rounded-lg hover:bg-teal transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2">
            ابدأ مجانًا الآن
            <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={() => router.push('/dashboard')} className="border-2 border-gray-border text-navy font-semibold py-3 px-6 rounded-lg hover:border-teal hover:text-teal transition-all flex items-center justify-center gap-2">
            <Play className="w-4 h-4" />
            شوف النتائج
          </button>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-8 pt-4 animate-fade-up" style={{ animationDelay: '0.4s' }}>
          <div className="text-right">
            <div className="text-2xl font-black font-display text-teal">2,500+</div>
            <div className="text-xs text-gray mt-1">طالب نجح في SDLE</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black font-display text-teal">94%</div>
            <div className="text-xs text-gray mt-1">نسبة النجاح في الاختبار التجريبي</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black font-display text-teal">18+</div>
            <div className="text-xs text-gray mt-1">مراجع موثوقة معتمدة</div>
          </div>
        </div>
      </div>

      {/* Visual Section - Platform Preview */}
      <div className="relative z-10 animate-fade-up order-first lg:order-last" style={{ animationDelay: '0.15s' }}>
        {/* Placeholder for interactive preview */}
        <div className="bg-navy rounded-2xl p-6 shadow-2xl overflow-hidden">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red"></div>
              <div className="w-3 h-3 rounded-full bg-amber"></div>
              <div className="w-3 h-3 rounded-full bg-green"></div>
            </div>
            <span className="text-xs text-white/40 ml-auto font-mono">dall.academy</span>
          </div>

          {/* Dashboard cards grid */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <div className="text-xs text-white/40 mb-2">الدرجة الحالية</div>
              <div className="text-2xl font-black font-display text-teal">742</div>
              <div className="text-xs text-white/30 mt-1">من 800</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <div className="text-xs text-white/40 mb-2">إتقان المقرر</div>
              <div className="text-2xl font-black font-display text-teal">87%</div>
              <div className="text-xs text-white/30 mt-1">الأسنان العامة</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <div className="text-xs text-white/40 mb-2">السؤال التالي</div>
              <div className="text-2xl font-black font-display text-teal">Q45</div>
              <div className="text-xs text-white/30 mt-1">من بنك الأسئلة</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <div className="text-xs text-white/40 mb-2">التقدم</div>
              <div className="text-2xl font-black font-display text-teal">64h</div>
              <div className="text-xs text-white/30 mt-1">وقت الدراسة</div>
            </div>
          </div>

          {/* Mini section bars */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="text-white/50 w-20 text-right">الأسنان العامة</div>
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-teal" style={{ width: '87%' }}></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-white/50 w-20 text-right">الجراحة</div>
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-teal" style={{ width: '72%' }}></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-white/50 w-20 text-right">التعويضات</div>
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-teal" style={{ width: '91%' }}></div>
              </div>
            </div>
          </div>

          {/* Q Preview */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-3 mt-3">
            <div className="text-xs text-white/50 mb-2 font-mono">#Q45</div>
            <div className="text-sm text-white/80 leading-relaxed mb-2">
              ما هي أنسب مادة عازلة للحفرة الجانبية عند استخدام تقنية الجدران الأفقية؟
            </div>
            <div className="space-y-1">
              <div className="p-1.5 rounded bg-white/5 border border-white/10 text-xs text-white/60">A) مادة رينة سائلة</div>
              <div className="p-1.5 rounded bg-teal/15 border border-teal text-xs text-teal-mid">B) الفلورسنت</div>
            </div>
            <div className="text-xs text-white/25 mt-2 font-mono">نيفيل - Clinical Guide (2019) p:342</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(22px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-up {
          animation: fadeUp 0.7s ease forwards;
          opacity: 0;
        }
      `}</style>
    </section>
  );
}
