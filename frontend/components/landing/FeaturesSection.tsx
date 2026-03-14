'use client';

export const features = [
  {
    tag: '📚 Referenced QBANK',
    title: 'بنك أسئلة موثق ومستند',
    description: 'بنك أسئلة شامل موزّع على الأقسام الخمسة حسب الـ Blueprint الرسمي — كل سؤال مربوط بمرجعه من +18 كتاب معتمد من SCFHS، مع شرح مفصّل للإجابة.',
    highlight: 'فلتر حسب القسم، الصعوبة، والمراجع',
    icon: '📚',
    color: 'teal',
  },
  {
    tag: '🎯 Mock Test',
    title: 'محاكاة الامتحان الحقيقي',
    description: '200 سؤال، قسمين × 120 دقيقة، استراحة 30 دقيقة — نفس بيئة الامتحان الحقيقي. نتيجة فورية على مقياس 200–800 مع تقرير أداء تفصيلي بعد كل محاولة.',
    highlight: 'تقرير أداء مقارن بالمتوسط العام',
    icon: '🎯',
    color: 'navy',
  },
  {
    tag: '📊 Dashboard',
    title: 'لوحة التدريب الشخصية',
    description: 'تابع تقدمك يوم بيوم — نسبة الإتقان لكل قسم، منحنى الأداء عبر الزمن، الأسئلة اللي غلطت فيها، وخطة مذاكرة مخصصة بناءً على نقاط ضعفك.',
    highlight: 'خطة مراجعة ذكية تتكيف مع أداءك',
    icon: '📊',
    color: 'teal',
  },
  {
    tag: '🧠 Socratic Tutoring',
    title: 'شرح ذكي بأسلوب سقراطي',
    description: 'بدل ما نعطيك الإجابة مباشرة، نساعدك تفكر بشكل منطقي — أسئلة موجهة وتلميحات دقيقة تساعدك تصل للإجابة بنفسك وتفهم السبب.',
    highlight: 'تعلم عميق وليس حفظ أسطر',
    icon: '🧠',
    color: 'navy',
  },
  {
    tag: '📈 Analytics',
    title: 'تحليلات متقدمة ودقيقة',
    description: 'رؤى تفصيلية عن نقاط قوتك وضعفك — خرائط حرارية للمواضيع الصعبة، مقارنة بالمتوسط العام، توقعات حول احتمالية النجاح.',
    highlight: 'بيانات تساعدك تخطط أفضل',
    icon: '📈',
    color: 'teal',
  },
  {
    tag: '🔒 Secure & Private',
    title: 'البيانات آمنة وخاصة',
    description: 'كل بيانات دراستك محمية بالتشفير — لا أحد يشوف إجاباتك، ولا الأسئلة اللي غلطت فيها. خصوصيتك والتزامك بـ PDPL مضمون.',
    highlight: 'تشفير عسكري لكل البيانات',
    icon: '🔒',
    color: 'navy',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-24 px-6 lg:px-14 bg-off-white">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <div className="inline-block text-xs font-bold text-teal tracking-widest uppercase mb-4">أدوات المنصة</div>
          <h2 className="text-3xl lg:text-4xl font-bold font-display text-navy mb-4 leading-tight">
            كل أداة صُمِّمت لـ SDLE
          </h2>
          <p className="text-lg text-gray max-w-2xl leading-relaxed">
            مو مجرد بنك أسئلة – ستة أدوات متكاملة تغطي كل جانب من التحضير، من الفهم للتدريب للمتابعة للتخطيط.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-border rounded-3xl overflow-hidden">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-white p-8 lg:p-10 hover:bg-off-white transition-colors relative overflow-hidden group"
            >
              {/* Hover gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>

              <div className={`inline-block mb-3 text-xs font-bold px-3 py-1 rounded-md ${
                feature.color === 'teal' ? 'bg-teal-light text-teal' : 'bg-navy text-white'
              }`}>
                {feature.tag}
              </div>

              <h3 className="text-xl font-bold font-arabic text-navy mb-3">
                {feature.title}
              </h3>

              <p className="text-gray leading-relaxed mb-4">
                {feature.description}
              </p>

              <div className={`p-3 rounded-lg text-sm font-bold ${
                feature.color === 'teal' 
                  ? 'bg-teal-light text-teal-dark' 
                  : 'bg-navy-light text-white'
              }`}>
                ✓ {feature.highlight}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
