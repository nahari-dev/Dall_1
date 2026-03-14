'use client';

import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';

export const pricingPlans = [
  {
    name: 'شهري',
    price: '99',
    period: 'شهر واحد — جرّب المنصة',
    features: [
      'بنك الأسئلة بكامل المراجع',
      'اختبار تجريبي واحد شهريًا',
      'لوحة تدريب شخصية',
      'تحليلات أساسية',
      'دعم عبر البريد الإلكتروني',
    ],
  },
  {
    name: 'سنوي',
    price: '299',
    period: 'سنة كاملة — وفّر 59%',
    features: [
      'كل ميزات الشهري',
      'اختبارات تجريبية غير محدودة',
      'تحليلات متقدمة جدًا',
      'خطط مذاكرة ذكية',
      'دعم أولويات 24/7',
      'شهادة إتمام الدورة',
    ],
    featured: true,
    badge: '⭐ الأوفر والأشهر',
  },
  {
    name: 'Dall Life',
    price: '499',
    period: 'معك لحد ما تعدي — 18 شهراً كحد أقصى',
    features: [
      'كل الميزات غير محدودة',
      'وصول دائم للمحتوى',
      'جلسات استشارة فردية',
      'ملف شامل للمراجع',
      'دعم متخصص مباشر',
      'ضمان النجاح في SDLE',
    ],
  },
];

export default function PricingSection() {
  const router = useRouter();
  return (
    <section id="pricing" className="py-20 lg:py-24 px-6 lg:px-14 bg-gradient-to-r from-navy via-navy-light to-navy text-center">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <div className="inline-block text-xs font-bold text-teal-mid tracking-widest uppercase mb-4">خطط الاشتراك</div>
          <h2 className="text-3xl lg:text-4xl font-bold font-display text-white mb-4 leading-tight">
            اختر خطتك
          </h2>
          <p className="text-lg text-white/60 max-w-2xl leading-relaxed mx-auto font-arabic">
            7 أيام مجانية تجرّب فيها كل شي — بدون بطاقة، بدون التزام.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {pricingPlans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-3xl p-8 lg:p-10 text-right transition-all ${
                plan.featured
                  ? 'bg-teal border-2 border-teal scale-105 shadow-2xl'
                  : 'bg-white/10 border border-white/20 hover:border-teal/50 hover:-translate-y-1'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-navy-mid text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                  {plan.badge}
                </div>
              )}

              <div className={`text-xs font-bold tracking-widest uppercase mb-3 ${
                plan.featured ? 'text-navy' : 'text-teal'
              }`}>
                {plan.name}
              </div>

              <div className="mb-2">
                <span className={`text-5xl lg:text-6xl font-black font-display ${
                  plan.featured ? 'text-navy' : 'text-white'
                }`}>
                  {plan.price}
                </span>
                <span className={`text-lg ml-2 ${
                  plan.featured ? 'text-navy/60' : 'text-white/60'
                }`}>
                  ر.س
                </span>
              </div>

              <p className={`text-sm mb-6 ${
                plan.featured ? 'text-navy/70' : 'text-white/60'
              }`}>
                {plan.period}
              </p>

              {/* Features List */}
              <ul className="space-y-3 mb-8 text-sm">
                {plan.features.map((feature, fidx) => (
                  <li
                    key={fidx}
                    className={`flex items-center gap-2 ${
                      plan.featured ? 'text-navy' : 'text-white/80'
                    }`}
                  >
                    <Check className={`w-4 h-4 flex-shrink-0 ${
                      plan.featured ? 'text-navy' : 'text-green'
                    }`} />
                    <span className="font-arabic">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => router.push('/chat')}
                className={`w-full font-bold py-3 px-6 rounded-lg transition-all font-arabic ${
                  plan.featured
                    ? 'bg-navy text-white hover:bg-navy-dark'
                    : 'bg-white text-teal hover:bg-off-white'
                }`}
              >
                اشترك الحين
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
