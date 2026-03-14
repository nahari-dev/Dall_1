'use client';

export const stats = [
  {
    number: '200',
    label: 'سؤال MCQ — قسمين × 100',
  },
  {
    number: '4h',
    label: 'المدة + 30 دقيقة استراحة',
  },
  {
    number: '542',
    label: 'درجة النجاح من 800',
  },
  {
    number: '5',
    label: 'أقسام رئيسية في الـ Blueprint',
  },
];

export default function StatsSection() {
  return (
    <section className="bg-navy py-16 lg:py-20 px-6 lg:px-14">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-navy/80 py-8 lg:py-12 px-4 lg:px-6 text-center border-r border-white/10 last:border-r-0"
            >
              <div className="text-3xl lg:text-5xl font-black font-display text-teal mb-2">
                {stat.number}
              </div>
              <div className="text-xs lg:text-sm text-white/50 font-arabic">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
