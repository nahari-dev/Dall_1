'use client'

import Link from 'next/link'
import { useState } from 'react'

/* ─── tiny inline SVGs ─────────────────────────────────────────────────── */
const CheckIco = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#22c55e" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
)
const ArrowLeft = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
  </svg>
)

/* ─── helpers ───────────────────────────────────────────────────────────── */
const teal   = '#4A8FA3'
const tealM  = '#7BB3C4'
const tealL  = '#D5E8F0'
const tealD  = '#357a8f'
const navy   = '#1A1A2E'
const navyM  = '#252545'
const gray   = '#6B7280'
const border = '#dde4ea'
const green  = '#22c55e'
const amber  = '#f59e0b'
const offW   = '#F5F9FB'

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [calcScore, setCalcScore]   = useState(612)

  /* specialty thresholds (illustrative) */
  const specialties = [
    { ar: 'تقويم الأسنان',     min: 650 },
    { ar: 'طب أسنان الأطفال', min: 620 },
    { ar: 'أمراض اللثة',      min: 600 },
    { ar: 'علاج الجذور',      min: 590 },
    { ar: 'تعويضات الأسنان',  min: 580 },
    { ar: 'جراحة الفم',       min: 560 },
  ]

  return (
    /* RTL wrapper — arabic direction */
    <div dir="rtl" lang="ar" style={{ fontFamily: "'IBM Plex Arabic', sans-serif", background: offW, color: navy, overflowX: 'hidden' }}>

      {/* ═══════════════════════════════════════════
          NAV
      ═══════════════════════════════════════════ */}
      <nav style={{
        position: 'fixed', top: 0, inset: '0 0 auto', zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 56px',
        background: 'rgba(245,249,251,0.95)',
        backdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${border}`,
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: `linear-gradient(135deg,${teal},${navy})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>D</span>
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: navy }}>Dall Academy</span>
        </Link>

        {/* Desktop links */}
        <ul style={{ display: 'flex', gap: 28, listStyle: 'none', margin: 0 }} className="hide-mobile">
          {[
            ['أدواتنا',      '#features'],
            ['بنك الأسئلة', '#qbank'],
            ['اختبار تجريبي','#mock'],
            ['لوحة التدريب', '#dashboard'],
            ['حاسبة القبول', '#calculator'],
            ['الأسعار',      '#pricing'],
          ].map(([label, href]) => (
            <li key={label}>
              <a href={href} style={{ fontSize: 13.5, fontWeight: 500, color: navy, textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget.style.color = teal)}
                onMouseLeave={e => (e.currentTarget.style.color = navy)}>
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop CTAs */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }} className="hide-mobile">
          <Link href="/login" style={{
            fontSize: 13, fontWeight: 500, background: 'transparent', color: navy,
            border: `1.5px solid ${border}`, borderRadius: 8, padding: '9px 20px',
            textDecoration: 'none', transition: '.2s',
          }}>تسجيل الدخول</Link>
          <Link href="/register" style={{
            fontSize: 13, fontWeight: 700, background: teal, color: '#fff',
            border: 'none', borderRadius: 8, padding: '9px 22px',
            textDecoration: 'none',
          }}>جرّب 7 أيام مجاناً</Link>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMobileOpen(!mobileOpen)}
          className="show-mobile"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 6 }}
          aria-label="قائمة">
          {mobileOpen
            ? <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={navy} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            : <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={navy} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>}
        </button>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', top: 64, right: 0, left: 0, zIndex: 199,
          background: 'rgba(245,249,251,0.98)', backdropFilter: 'blur(24px)',
          borderBottom: `1px solid ${border}`,
          padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {[
            ['أدواتنا','#features'],['بنك الأسئلة','#qbank'],
            ['اختبار تجريبي','#mock'],['لوحة التدريب','#dashboard'],
            ['حاسبة القبول','#calculator'],['الأسعار','#pricing'],
          ].map(([label, href]) => (
            <a key={label} href={href} onClick={() => setMobileOpen(false)}
              style={{
                fontSize: 15, fontWeight: 500, color: navy, textDecoration: 'none',
                padding: '11px 0', borderBottom: `1px solid ${border}`,
              }}>{label}</a>
          ))}
          <Link href="/register" onClick={() => setMobileOpen(false)}
            style={{
              marginTop: 12, background: teal, color: '#fff', textAlign: 'center',
              borderRadius: 10, padding: 13, fontWeight: 700, textDecoration: 'none',
              fontSize: 14,
            }}>جرّب 7 أيام مجاناً</Link>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════ */}
      <section style={{
        minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr',
        alignItems: 'center', padding: '120px 56px 80px', gap: 60,
        position: 'relative', overflow: 'hidden',
      }} className="hero-grid">
        {/* BG decorations */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `linear-gradient(rgba(74,143,163,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(74,143,163,.04) 1px,transparent 1px)`,
          backgroundSize: '52px 52px',
        }} />
        <div style={{
          position: 'absolute', width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle,rgba(74,143,163,.08) 0%,transparent 70%)',
          left: -100, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none',
        }} />

        {/* Text column */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: tealL, color: teal,
            border: `1px solid rgba(74,143,163,.3)`, borderRadius: 100,
            padding: '5px 16px', fontSize: 12.5, fontWeight: 600, marginBottom: 26,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: teal, animation: 'pulse 2s infinite', display: 'inline-block' }} />
            المنصة الأولى في السعودية للتحضير لـ SDLE
          </div>

          <h1 style={{
            fontSize: 52, fontWeight: 700, lineHeight: 1.2, color: navy,
            marginBottom: 22,
          }}
            className="hero-h1">
            كل ما تحتاجه للنجاح في{' '}
            <span style={{ color: teal }}>اختبار الترخيص</span>{' '}
            <span style={{ color: navyM }}>السعودي لطب الأسنان</span>
          </h1>

          <p style={{ fontSize: 16.5, color: gray, lineHeight: 1.85, marginBottom: 36, maxWidth: 480 }}>
            خطط دراسية بالذكاء الاصطناعي، بنك أسئلة مرجعي بأكثر من 1000 سؤال، اختبارات تجريبية واقعية، ولوحة تدريب ذكية — مُصمَّمة خصيصاً لاجتياز SDLE.
          </p>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 36 }}>
            <Link href="/register" style={{
              fontFamily: "'IBM Plex Arabic', sans-serif",
              fontSize: 15, fontWeight: 700, background: navy, color: '#fff',
              border: 'none', borderRadius: 10, padding: '14px 30px',
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              ابدأ التجربة المجانية <ArrowLeft />
            </Link>
            <a href="#features" style={{
              fontSize: 15, fontWeight: 500, background: 'transparent', color: navy,
              border: `1.5px solid ${border}`, borderRadius: 10, padding: '14px 26px',
              textDecoration: 'none',
            }}>كيف يعمل</a>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
            {[
              { num: '200', lbl: 'سؤال في الاختبار' },
              { num: '542', lbl: 'درجة النجاح' },
              { num: '+18', lbl: 'مرجع SCFHS' },
            ].map(s => (
              <div key={s.num} style={{ textAlign: 'right' }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 900, color: teal, display: 'block', lineHeight: 1 }}>{s.num}</span>
                <span style={{ fontSize: 11.5, color: gray, marginTop: 3, display: 'block', fontFamily: "'DM Sans', sans-serif" }}>{s.lbl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Platform preview */}
        <div style={{ position: 'relative', zIndex: 1 }} className="hero-visual">
          {/* Floating card top */}
          <div style={{
            position: 'absolute', top: -16, right: -20, background: '#fff',
            border: `1px solid ${border}`, borderRadius: 12, padding: '10px 14px',
            boxShadow: '0 8px 28px rgba(0,0,0,.1)',
            display: 'flex', alignItems: 'center', gap: 10,
            fontSize: 12, fontWeight: 600, color: navy, zIndex: 10,
            animation: 'float 3s ease-in-out infinite',
          }}>
            <span style={{ width: 28, height: 28, borderRadius: '50%', background: tealL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: teal, fontWeight: 700 }}>AI</span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700 }}>المساعد الذكي نشط</div>
              <div style={{ fontSize: 10, color: gray }}>يحلل نقاط ضعفك...</div>
            </div>
          </div>

          {/* Main dark card */}
          <div style={{
            background: navy, borderRadius: 20, padding: 20,
            boxShadow: `0 40px 80px rgba(26,26,46,.3), 0 0 0 1px rgba(255,255,255,.06)`,
            overflow: 'hidden',
          }}>
            {/* Traffic lights */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid rgba(255,255,255,.07)' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
              </div>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,.4)', marginRight: 'auto' }}>dall-academy/dashboard</span>
            </div>

            {/* Stat cards 2×2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              {[
                { lbl: 'الأسئلة المحلولة', val: '148', sub: '/ 200' },
                { lbl: 'درجة الاختبار التجريبي', val: '612', sub: '/ 800' },
                { lbl: 'الدقة', val: '76%', sub: '+4% هذا الأسبوع' },
                { lbl: 'ايام متواصلة', val: '14', sub: 'يوم 🔥' },
              ].map(s => (
                <div key={s.lbl} style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontFamily: "'DM Sans',sans-serif", marginBottom: 8 }}>{s.lbl}</div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, color: teal }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>{s.sub}</div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,.08)', borderRadius: 4, marginTop: 6, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 4, background: `linear-gradient(90deg,${teal},${tealM})`, width: '70%' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Section bars */}
            <div style={{ marginBottom: 10 }}>
              {[
                { name: 'أمراض اللثة',     pct: 82 },
                { name: 'علاج الجذور',     pct: 65 },
                { name: 'ترميمي',          pct: 71 },
                { name: 'تقويم وأطفال',   pct: 58 },
                { name: 'طب الفم',         pct: 44 },
              ].map(sec => (
                <div key={sec.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 9.5, color: 'rgba(255,255,255,.5)', width: 80, textAlign: 'right', fontFamily: "'DM Sans',sans-serif", flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sec.name}</span>
                  <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,.07)', borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 6, background: teal, width: `${sec.pct}%` }} />
                  </div>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', fontFamily: "'DM Sans',sans-serif", width: 28 }}>{sec.pct}%</span>
                </div>
              ))}
            </div>

            {/* MCQ preview */}
            <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 11, color: '#e2e8f0', lineHeight: 1.55, marginBottom: 10 }}>
                مريض عمره 35 سنة يعاني من جيب لثوي عمقه 6mm على السطح الأنسي للسن 14، ما هو أفضل علاج؟
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {[
                  { opt: 'أ. تنظيف وتسوية الجذور',        correct: false },
                  { opt: 'ب. رفع السديلة الجراحي',        correct: false },
                  { opt: 'ج. التجديد الموجَّه للأنسجة',   correct: true  },
                  { opt: 'د. الخلع',                       correct: false },
                ].map(o => (
                  <div key={o.opt} style={{
                    fontSize: 10.5, padding: '6px 10px', borderRadius: 6,
                    border: `1px solid ${o.correct ? teal : 'rgba(255,255,255,.07)'}`,
                    background: o.correct ? 'rgba(74,143,163,.15)' : 'transparent',
                    color: o.correct ? tealM : 'rgba(255,255,255,.6)',
                  }}>{o.opt}</div>
                ))}
              </div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,.25)', marginTop: 8, fontFamily: "'JetBrains Mono',monospace" }}>
                Carranza&apos;s Clinical Periodontology, Ch.29, p.384
              </div>
            </div>
          </div>

          {/* Floating card bottom */}
          <div style={{
            position: 'absolute', bottom: -16, left: -20, background: '#fff',
            border: `1px solid ${border}`, borderRadius: 12, padding: '10px 14px',
            boxShadow: '0 8px 28px rgba(0,0,0,.1)',
            display: 'flex', alignItems: 'center', gap: 10,
            fontSize: 12, fontWeight: 600, color: navy, zIndex: 10,
            animation: 'float 3s 1.5s ease-in-out infinite',
          }}>
            <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 14 }}>✅</span>
            </span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700 }}>الاختبار التجريبي مكتمل</div>
              <div style={{ fontSize: 10, color: gray }}>الدرجة: 612 / 800</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          STATS BAND
      ═══════════════════════════════════════════ */}
      <div style={{ background: navy, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }} className="stats-band-grid">
        {[
          { num: '200', lbl: 'سؤال MCQ — قسمين × 100' },
          { num: '4h',  lbl: 'المدة + 30 دقيقة استراحة' },
          { num: '542', lbl: 'درجة النجاح من 800' },
          { num: '5',   lbl: 'أقسام رئيسية في الـ Blueprint' },
        ].map((s, i) => (
          <div key={s.num} style={{
            padding: '36px 32px', textAlign: 'center',
            borderLeft: i < 3 ? '1px solid rgba(255,255,255,.06)' : 'none',
          }}>
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 44, fontWeight: 900, color: teal, display: 'block', letterSpacing: -1 }}>{s.num}</span>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: 'rgba(255,255,255,.4)', marginTop: 5, display: 'block' }}>{s.lbl}</span>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════
          FEATURES
      ═══════════════════════════════════════════ */}
      <section id="features" style={{ padding: '96px 56px', background: offW }} className="section-pad">
        <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: teal, marginBottom: 14 }}>أدوات المنصة</div>
        <div style={{ fontSize: 38, fontWeight: 700, color: navy, marginBottom: 14, lineHeight: 1.25 }} className="section-h">كل أداة صُمِّمت لـ SDLE</div>
        <p style={{ fontSize: 16, color: gray, maxWidth: 560, lineHeight: 1.8, marginBottom: 56 }}>
          مو مجرد بنك أسئلة — خمس أدوات متكاملة تغطي كل جانب من التحضير، من الفهم للتدريب للمتابعة للتخطيط.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 2, background: border, borderRadius: 20, overflow: 'hidden' }} className="feat-grid">
          {[
            {
              icon: '🧠', iconBg: tealL, tag: 'ذكاء اصطناعي',
              title: 'Guider الذكي — مرشدك الشخصي',
              desc: 'مرشدك الذكي المتخصص في SDLE. يجيب على أسئلتك السريرية بمراجع SCFHS، يتكيف مع أسلوبك، ويحدد الثغرات في معرفتك.',
              highlight: 'يعمل بنماذج ذكاء اصطناعي مدرَّبة على مراجع SCFHS المعتمدة',
            },
            {
              icon: '📋', iconBg: 'rgba(26,26,46,.07)', tag: 'مرجعي',
              title: 'بنك الأسئلة المرجعي',
              desc: 'أكثر من 1000 سؤال MCQ مرتبط بالأقسام الخمسة لـ SDLE. كل إجابة مدعومة بمرجع مباشر من الكتب المعتمدة من SCFHS.',
              highlight: '1000+ سؤال مع مصادر لكل إجابة من مراجع SCFHS',
            },
            {
              icon: '⏱️', iconBg: tealL, tag: 'محاكاة',
              title: 'الاختبار التجريبي الحقيقي',
              desc: 'اختبار موقوت يحاكي الاختبار الفعلي تماماً: 200 سؤال، 4 ساعات، توزيع موزون على الأقسام، وتحليل مفصل بعد الاختبار.',
              highlight: 'نسخة طبق الأصل من صيغة SDLE مع توقع الدرجة',
            },
            {
              icon: '📊', iconBg: 'rgba(26,26,46,.07)', tag: 'تحليلات',
              title: 'لوحة التدريب الذكية',
              desc: 'تتبع مستوى إتقانك في جميع الأقسام الخمسة، راقب الأيام المتواصلة، واحصل على توصيات دراسية مخصصة بالذكاء الاصطناعي.',
              highlight: 'تتبع فوري للإتقان عبر جميع أقسام SDLE',
            },
          ].map((f, i) => (
            <div key={f.title} style={{
              background: '#fff', padding: 40, position: 'relative', overflow: 'hidden',
              borderRadius: i === 0 ? '18px 0 0 0' : i === 1 ? '0 18px 0 0' : i === 2 ? '0 0 0 18px' : '0 0 18px 0',
            }} className="feat-card">
              <div style={{ width: 52, height: 52, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, fontSize: 24, background: f.iconBg }}>
                {f.icon}
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: tealL, color: teal, borderRadius: 6, padding: '2px 10px', fontSize: 10.5, fontWeight: 600, marginBottom: 12, fontFamily: "'DM Sans',sans-serif" }}>
                {f.tag}
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: navy, marginBottom: 10 }}>{f.title}</div>
              <p style={{ fontSize: 14, color: gray, lineHeight: 1.8, marginBottom: 20 }}>{f.desc}</p>
              <div style={{ padding: '14px 16px', background: tealL, borderRadius: 10, fontSize: 13, color: tealD, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckIco /> {f.highlight}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          Q-BANK
      ═══════════════════════════════════════════ */}
      <section id="qbank" style={{ padding: '96px 56px', background: '#fff' }} className="section-pad">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }} className="two-col">
          {/* Text */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: teal, marginBottom: 14, fontFamily: "'DM Sans',sans-serif" }}>بنك الأسئلة</div>
            <h2 style={{ fontSize: 38, fontWeight: 700, color: navy, marginBottom: 14, lineHeight: 1.25 }} className="section-h">أكثر من 1000 سؤال مرجعي</h2>
            <p style={{ fontSize: 16, color: gray, lineHeight: 1.8, marginBottom: 24 }}>
              كل سؤال مرتبط بأحد الأقسام الخمسة لـ SDLE ومدعوم بمرجع من الكتب المعتمدة من SCFHS. صفّي حسب القسم أو الصعوبة وتتبع تقدمك لحظة بلحظة.
            </p>
            <ul style={{ listStyle: 'none', marginBottom: 32 }}>
              {[
                'أسئلة موزّعة على جميع تخصصات SDLE الخمسة',
                'مرجع كتاب لكل إجابة صحيحة',
                'صعوبة تكيّفية بناءً على أداءك',
                'احفظ وضع ملاحظات للمراجعة',
              ].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: navy, marginBottom: 14 }}>
                  <CheckIco /> {item}
                </li>
              ))}
            </ul>
            <Link href="/register" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: teal, color: '#fff', fontWeight: 700, padding: '14px 24px',
              borderRadius: 10, textDecoration: 'none', fontSize: 15,
            }}>جرّب بنك الأسئلة مجاناً <ArrowLeft /></Link>
          </div>

          {/* Mockup */}
          <div style={{ background: navy, borderRadius: 18, padding: 24, boxShadow: '0 24px 60px rgba(26,26,46,.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, color: '#fff' }}>بنك الأسئلة</span>
              <span style={{ background: 'rgba(74,143,163,.2)', color: tealM, fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 100, border: `1px solid rgba(74,143,163,.3)` }}>SDLE — 2025</span>
            </div>
            {/* Filter chips */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
              {['الكل','أمراض اللثة','علاج الجذور','ترميمي','تقويم'].map((chip, i) => (
                <span key={chip} style={{
                  background: i === 0 ? 'rgba(74,143,163,.2)' : 'rgba(255,255,255,.06)',
                  border: `1px solid ${i === 0 ? teal : 'rgba(255,255,255,.1)'}`,
                  color: i === 0 ? tealM : 'rgba(255,255,255,.6)',
                  fontFamily: "'DM Sans',sans-serif", fontSize: 10, padding: '5px 12px', borderRadius: 100,
                }}>{chip}</span>
              ))}
            </div>
            {/* Question */}
            <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12, padding: 16, marginBottom: 12 }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9.5, color: 'rgba(255,255,255,.25)', display: 'block', marginBottom: 8 }}>Q-0147 · أمراض اللثة · متوسط</span>
              <p style={{ fontSize: 12, color: '#e2e8f0', lineHeight: 1.6, marginBottom: 12 }}>
                أي تصنيف من تصنيفات الإصابة بالمشعب يشير إلى فقدان عظمي أفقي يتجاوز ثلث عرض السن دون أن يشمل العرض بالكامل؟
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[
                  { opt: 'أ. الدرجة الأولى', correct: false },
                  { opt: 'ب. الدرجة الثانية', correct: true  },
                  { opt: 'ج. الدرجة الثالثة', correct: false },
                  { opt: 'د. الدرجة الرابعة', correct: false },
                ].map(o => (
                  <div key={o.opt} style={{
                    padding: '8px 10px', borderRadius: 8,
                    border: `1px solid ${o.correct ? 'rgba(34,197,94,.3)' : 'rgba(255,255,255,.07)'}`,
                    background: o.correct ? 'rgba(34,197,94,.15)' : 'transparent',
                    fontSize: 10.5, color: o.correct ? green : 'rgba(255,255,255,.6)',
                    textAlign: 'center',
                  }}>{o.opt}</div>
                ))}
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,.03)', borderRadius: 8, padding: '8px 12px', fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: 'rgba(255,255,255,.25)' }}>
              📖 Carranza&apos;s Clinical Periodontology, Ch.29, p.384
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          MOCK TEST
      ═══════════════════════════════════════════ */}
      <section id="mock" style={{ padding: '96px 56px', background: offW }} className="section-pad">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }} className="two-col">
          {/* Mockup */}
          <div style={{ background: navy, borderRadius: 18, overflow: 'hidden', boxShadow: '0 24px 60px rgba(26,26,46,.2)' }}>
            {/* top bar */}
            <div style={{ background: 'rgba(0,0,0,.25)', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: 'rgba(255,255,255,.5)' }}>SDLE — القسم الأول</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 22, fontWeight: 600, color: teal, letterSpacing: 2 }}>02:14:33</span>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: 'rgba(255,255,255,.4)' }}>س 87 / 100</span>
            </div>
            <div style={{ height: 3, background: 'rgba(255,255,255,.07)' }}>
              <div style={{ height: '100%', background: `linear-gradient(90deg,${teal},${tealM})`, width: '38%' }} />
            </div>
            <div style={{ padding: 20 }}>
              <p style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.65, marginBottom: 16 }}>
                ما هو السبب الأكثر شيوعاً لفشل علاج قناة الجذر؟
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { opt: 'أ. قنوات غير محدَّدة', sel: true  },
                  { opt: 'ب. حشو زائد',          sel: false },
                  { opt: 'ج. إزالة أنسجة غير كافية', sel: false },
                  { opt: 'د. كسر الأداة',        sel: false },
                ].map(o => (
                  <div key={o.opt} style={{
                    padding: '11px 14px', borderRadius: 9,
                    border: `1px solid ${o.sel ? teal : 'rgba(255,255,255,.08)'}`,
                    background: o.sel ? 'rgba(74,143,163,.12)' : 'transparent',
                    fontSize: 12, color: o.sel ? tealM : 'rgba(255,255,255,.7)',
                    display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                  }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%',
                      border: `1px solid ${o.sel ? teal : 'rgba(255,255,255,.15)'}`,
                      background: o.sel ? teal : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, flexShrink: 0, color: o.sel ? '#fff' : 'rgba(255,255,255,.4)',
                    }}>{o.opt[0]}</div>
                    {o.opt}
                  </div>
                ))}
              </div>
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,.06)',
            }}>
              <button style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, padding: '8px 18px', borderRadius: 8, cursor: 'pointer', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.6)', background: 'transparent' }}>السابق</button>
              <span style={{ fontSize: 11, color: amber, fontFamily: "'DM Sans',sans-serif" }}>⚑ علّم للمراجعة</span>
              <button style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, padding: '8px 18px', borderRadius: 8, cursor: 'pointer', border: `1px solid ${teal}`, color: '#fff', background: teal }}>التالي</button>
            </div>
          </div>

          {/* Text */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: teal, marginBottom: 14, fontFamily: "'DM Sans',sans-serif" }}>اختبار تجريبي</div>
            <h2 style={{ fontSize: 38, fontWeight: 700, color: navy, marginBottom: 14, lineHeight: 1.25 }} className="section-h">محاكاة الاختبار الحقيقي</h2>
            <p style={{ fontSize: 16, color: gray, lineHeight: 1.8, marginBottom: 24 }}>
              اختبار تجريبي بـ 200 سؤال و4 ساعات يعكس تماماً هيكل SDLE الفعلي. احصل على درجة مقسَّمة على الأقسام، واحتمالية النجاح، وتحليل مفصّل بعد كل محاولة.
            </p>
            <ul style={{ listStyle: 'none', marginBottom: 32 }}>
              {[
                '200 سؤال مع عداد زمني 4 ساعات',
                'توزيع موزون على الأقسام',
                'تحليل ما بعد الاختبار مع توقع الدرجة',
                'مقارنة الأداء عبر المحاولات',
              ].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: navy, marginBottom: 14 }}>
                  <CheckIco /> {item}
                </li>
              ))}
            </ul>
            <Link href="/register" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: teal, color: '#fff', fontWeight: 700, padding: '14px 24px',
              borderRadius: 10, textDecoration: 'none', fontSize: 15,
            }}>جرّب الاختبار التجريبي <ArrowLeft /></Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          DASHBOARD
      ═══════════════════════════════════════════ */}
      <section id="dashboard" style={{ padding: '96px 56px', background: '#fff' }} className="section-pad">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }} className="two-col">
          {/* Text */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: teal, marginBottom: 14, fontFamily: "'DM Sans',sans-serif" }}>لوحة التدريب</div>
            <h2 style={{ fontSize: 38, fontWeight: 700, color: navy, marginBottom: 14, lineHeight: 1.25 }} className="section-h">تتبع كل مقياس يهمك</h2>
            <p style={{ fontSize: 16, color: gray, lineHeight: 1.8, marginBottom: 24 }}>
              تحليلات فورية عبر جميع أقسام SDLE الخمسة مع توصيات دراسية مخصصة بالذكاء الاصطناعي بناءً على نقاط ضعفك.
            </p>
            <ul style={{ listStyle: 'none', marginBottom: 32 }}>
              {[
                'تتبع الإتقان لكل قسم من الأقسام الخمسة',
                'مقياس الأيام المتواصلة والأهداف اليومية',
                'رسم بياني لتطور درجاتك عبر الوقت',
                'توصيات ذكاء اصطناعي مخصصة لأضعف نقاطك',
              ].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: navy, marginBottom: 14 }}>
                  <CheckIco /> {item}
                </li>
              ))}
            </ul>
            <Link href="/register" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: teal, color: '#fff', fontWeight: 700, padding: '14px 24px',
              borderRadius: 10, textDecoration: 'none', fontSize: 15,
            }}>ابدأ التتبع مجاناً <ArrowLeft /></Link>
          </div>

          {/* Mockup */}
          <div style={{ background: navy, borderRadius: 18, padding: 24, boxShadow: '0 24px 60px rgba(26,26,46,.2)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
              {[
                { lbl: 'الدرجة الكلية', val: '612', unit: '/ 800' },
                { lbl: 'الأسئلة المحلولة', val: '847', unit: '/ 1000' },
                { lbl: 'أيام متواصلة', val: '14', unit: 'يوم' },
                { lbl: 'احتمال النجاح', val: '78%', unit: '' },
              ].map(c => (
                <div key={c.lbl} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: 'rgba(255,255,255,.35)', marginBottom: 4 }}>{c.lbl}</div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 900, color: teal }}>
                    {c.val}<span style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', fontFamily: 'inherit', marginRight: 3 }}>{c.unit}</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Section mastery bars */}
            <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12, padding: 16 }}>
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 14 }}>إتقان الأقسام</div>
              {[
                { name: 'أمراض اللثة',   pct: 82, color: teal   },
                { name: 'علاج الجذور',   pct: 65, color: tealM  },
                { name: 'ترميمي',        pct: 71, color: teal   },
                { name: 'تقويم وأطفال', pct: 58, color: tealM  },
                { name: 'طب الفم والجراحة',pct: 44, color: teal },
              ].map(sec => (
                <div key={sec.name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', fontFamily: "'DM Sans',sans-serif", width: 100, flexShrink: 0 }}>{sec.name}</span>
                  <div style={{ flex: 1, height: 7, background: 'rgba(255,255,255,.07)', borderRadius: 7, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 7, background: sec.color, width: `${sec.pct}%` }} />
                  </div>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: 'rgba(255,255,255,.4)', width: 30 }}>{sec.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          MATCHING CALCULATOR
      ═══════════════════════════════════════════ */}
      <section id="calculator" style={{ padding: '96px 56px', background: offW }} className="section-pad">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }} className="two-col">
          {/* Mockup */}
          <div style={{ background: navy, borderRadius: 18, padding: 28, boxShadow: '0 24px 60px rgba(26,26,46,.2)' }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: "'IBM Plex Arabic',sans-serif", fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>حاسبة القبول في التخصص</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', fontFamily: "'DM Sans',sans-serif" }}>اعرف تخصصك الأنسب بناءً على درجتك</div>
            </div>

            {/* Slider */}
            <div style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', fontFamily: "'DM Sans',sans-serif", marginBottom: 6 }}>درجتك المتوقعة في SDLE</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 36, fontWeight: 900, color: '#fff' }}>
                {calcScore}
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,.3)', fontFamily: "'DM Sans',sans-serif", marginRight: 8 }}>/ 800</span>
              </div>
              <input type="range" min={200} max={800} value={calcScore}
                onChange={e => setCalcScore(+e.target.value)}
                style={{ width: '100%', marginTop: 10, accentColor: teal, cursor: 'pointer' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'rgba(255,255,255,.25)', fontFamily: "'DM Sans',sans-serif", marginTop: 4 }}>
                <span>200</span><span>درجة الرسوب 542</span><span>800</span>
              </div>
            </div>

            {/* Result score */}
            <div style={{
              background: 'linear-gradient(135deg,rgba(74,143,163,.15),rgba(74,143,163,.05))',
              border: '1px solid rgba(74,143,163,.25)', borderRadius: 12, padding: 20, textAlign: 'center', marginBottom: 16,
            }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', fontFamily: "'DM Sans',sans-serif", marginBottom: 8 }}>درجتك المتوقعة</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 52, fontWeight: 900, color: teal }}>{calcScore}</div>
              <div style={{ fontFamily: "'IBM Plex Arabic',sans-serif", fontSize: 14, fontWeight: 600, color: calcScore >= 542 ? green : '#ef4444', marginTop: 4 }}>
                {calcScore >= 542 ? '✅ ناجح — تأهّلت للتخصص' : '❌ لم تصل لدرجة النجاح بعد'}
              </div>
            </div>

            {/* Specialty chips */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {specialties.map(sp => (
                <div key={sp.ar} style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, padding: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', fontFamily: "'DM Sans',sans-serif", marginBottom: 3 }}>{sp.ar}</div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 600, color: tealM }}>{sp.min}+</div>
                  <div style={{ fontSize: 9, fontFamily: "'DM Sans',sans-serif", color: calcScore >= sp.min ? green : 'rgba(239,68,68,.7)' }}>
                    {calcScore >= sp.min ? '✓ مؤهَّل' : '✗ غير مؤهَّل'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Text */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: teal, marginBottom: 14, fontFamily: "'DM Sans',sans-serif" }}>حاسبة القبول</div>
            <h2 style={{ fontSize: 38, fontWeight: 700, color: navy, marginBottom: 14, lineHeight: 1.25 }} className="section-h">اعرف تخصصك الأنسب</h2>
            <p style={{ fontSize: 16, color: gray, lineHeight: 1.8, marginBottom: 24 }}>
              أدخل درجتك المتوقعة في SDLE واعرف أي تخصصات دكتوراه وبورد يمكنك التقدم لها فوراً — مع الحد الأدنى المطلوب لكل برنامج.
            </p>
            <ul style={{ listStyle: 'none', marginBottom: 32 }}>
              {[
                'حسابات فورية بناءً على معايير SCFHS',
                'تغطية جميع البرامج التخصصية السعودية',
                'توصيات مخصصة لتحسين درجتك',
                'مقارنة بأعلى الدرجات في مركزك',
              ].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: navy, marginBottom: 14 }}>
                  <CheckIco /> {item}
                </li>
              ))}
            </ul>
            <Link href="/register" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: navy, color: '#fff', fontWeight: 700, padding: '14px 24px',
              borderRadius: 10, textDecoration: 'none', fontSize: 15,
            }}>جرّب الحاسبة مجاناً <ArrowLeft /></Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PRICING
      ═══════════════════════════════════════════ */}
      <section id="pricing" style={{ padding: '96px 56px', background: `linear-gradient(165deg,${navy} 0%,#0d1220 100%)`, textAlign: 'center' }} className="section-pad">
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: tealM, marginBottom: 14, fontFamily: "'DM Sans',sans-serif" }}>خطط الاشتراك</div>
        <h2 style={{ fontSize: 38, fontWeight: 700, color: '#fff', marginBottom: 14, lineHeight: 1.25 }} className="section-h">اختر خطتك</h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,.4)', maxWidth: 560, margin: '0 auto 56px', lineHeight: 1.8 }}>
          7 أيام مجانية تجرّب فيها كل شي — بدون بطاقة، بدون التزام.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, maxWidth: 920, margin: '0 auto' }} className="pricing-grid">
          {[
            {
              name: 'أساسي', price: '99', period: '/شهر', featured: false, badge: null,
              features: ['بنك الأسئلة كاملاً','اختبارات تجريبية غير محدودة','Guider الذكي (محدود)','لوحة التدريب','دعم عبر البريد'],
            },
            {
              name: 'سنوي', price: '899', period: '/سنة', featured: true, badge: 'الأكثر شيوعاً',
              features: ['كل ما في الأساسي','Guider الذكي غير محدود','دعم أولوية','مولّد خطط الدراسة','تحليلات الأداء'],
            },
            {
              name: 'مدى الحياة', price: '2,499', period: '', featured: false, badge: null,
              features: ['كل ما في السنوي','وصول مدى الحياة','جميع التحديثات المستقبلية','دعم فردي عند البدء','وصول للمجتمع'],
            },
          ].map(plan => (
            <div key={plan.name} style={{
              background: plan.featured ? teal : 'rgba(255,255,255,.05)',
              border: `1px solid ${plan.featured ? teal : 'rgba(255,255,255,.09)'}`,
              borderRadius: 20, padding: '36px 28px', textAlign: 'right',
              position: 'relative',
              transform: plan.featured ? 'scale(1.045)' : 'none',
              boxShadow: plan.featured ? `0 20px 60px rgba(74,143,163,.4)` : 'none',
            }}>
              {plan.badge && (
                <span style={{
                  position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
                  background: navyM, color: '#fff', fontFamily: "'DM Sans',sans-serif",
                  fontSize: 10.5, fontWeight: 700, padding: '4px 14px', borderRadius: 100,
                  whiteSpace: 'nowrap', border: '1px solid rgba(255,255,255,.1)',
                }}>{plan.badge}</span>
              )}
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10.5, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,.5)', marginBottom: 10 }}>{plan.name}</div>
              <div>
                <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 46, fontWeight: 900, color: '#fff' }}>{plan.price}</span>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: 'rgba(255,255,255,.5)' }}> ر.س{plan.period}</span>
              </div>
              <ul style={{ listStyle: 'none', margin: '24px 0 28px', padding: 0 }}>
                {plan.features.map(f => (
                  <li key={f} style={{
                    fontSize: 13, color: 'rgba(255,255,255,.8)', padding: '8px 0',
                    display: 'flex', alignItems: 'center', gap: 8,
                    borderBottom: '1px solid rgba(255,255,255,.06)',
                    fontFamily: "'IBM Plex Arabic',sans-serif",
                  }}>
                    <CheckIco /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" style={{
                display: 'block', textAlign: 'center', width: '100%',
                fontFamily: "'IBM Plex Arabic',sans-serif", fontSize: 14, fontWeight: 700,
                padding: 13, borderRadius: 10, textDecoration: 'none',
                background: plan.featured ? navy : '#fff',
                color: plan.featured ? '#fff' : teal,
              }}>
                {plan.featured ? 'ابدأ التجربة المجانية' : 'ابدأ الآن'}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CTA BAND
      ═══════════════════════════════════════════ */}
      <div style={{
        background: tealL, padding: '80px 56px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40,
        flexWrap: 'wrap',
      }}>
        <div>
          <h2 style={{ fontFamily: "'IBM Plex Arabic',sans-serif", fontSize: 32, fontWeight: 700, color: navy, marginBottom: 10 }}>مستعد تجتاز الـ SDLE؟</h2>
          <p style={{ fontSize: 15, color: gray }}>انضم لمئات أطباء الأسنان المتحضرين لـ SDLE مع أدوات مدعومة بالذكاء الاصطناعي.</p>
        </div>
        <div style={{ display: 'flex', gap: 14, flexShrink: 0, flexWrap: 'wrap' }}>
          <Link href="/register" style={{
            fontFamily: "'IBM Plex Arabic',sans-serif", fontSize: 15, fontWeight: 700,
            background: navy, color: '#fff', border: 'none', borderRadius: 10,
            padding: '14px 30px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>ابدأ التجربة المجانية <ArrowLeft /></Link>
          <Link href="/login" style={{
            fontFamily: "'IBM Plex Arabic',sans-serif", fontSize: 15, fontWeight: 500,
            background: 'transparent', color: navy,
            border: `1.5px solid ${border}`, borderRadius: 10,
            padding: '14px 26px', textDecoration: 'none',
          }}>تسجيل الدخول</Link>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════ */}
      <footer style={{ background: navy, padding: '36px 56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg,${teal},${navyM})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>D</span>
          </div>
          <span style={{ color: '#fff', fontWeight: 700 }}>Dall Academy</span>
        </div>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: 'rgba(255,255,255,.25)' }}>
          © {new Date().getFullYear()} Dall Academy. جميع الحقوق محفوظة.
        </p>
      </footer>

      {/* ─── Global styles ─────────────────────────────────────────────────── */}
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.8)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .hide-mobile { display:flex !important; }
        .show-mobile { display:none !important; }
        @media(max-width:768px){
          .hide-mobile  { display:none !important; }
          .show-mobile  { display:flex !important; }
          .hero-grid    { grid-template-columns:1fr !important; padding:90px 20px 48px !important; min-height:auto !important; }
          .hero-visual  { display:none !important; }
          .hero-h1      { font-size:32px !important; }
          .section-pad  { padding:56px 20px !important; }
          .section-h    { font-size:26px !important; }
          .two-col      { grid-template-columns:1fr !important; gap:32px !important; }
          .feat-grid    { grid-template-columns:1fr !important; gap:0 !important; }
          .feat-card    { border-radius:0 !important; padding:28px 20px !important; }
          .feat-card:first-child { border-radius:16px 16px 0 0 !important; }
          .feat-card:last-child  { border-radius:0 0 16px 16px !important; }
          .stats-band-grid { grid-template-columns:1fr 1fr !important; }
          .pricing-grid    { grid-template-columns:1fr !important; max-width:400px !important; margin-inline:auto !important; }
        }
        @media(max-width:380px){
          .hero-h1 { font-size:27px !important; }
        }
      `}</style>
    </div>
  )
}


