'use client'

import { useState, useMemo } from 'react'

const CV_CRITERIA = [
  {
    id: 'research',
    ar: 'بحث علمي منشور في مجلة محكّمة',
    en: 'Published research in peer-reviewed journal',
    pts: 5,
  },
  {
    id: 'postgrad',
    ar: 'درجة علمية عليا (دبلوم، ماجستير، دكتوراه)',
    en: 'Postgraduate medical/health degree',
    pts: 3,
  },
  {
    id: 'exp',
    ar: '٦ أشهر أو أكثر خبرة سريرية في التخصص المفضّل الأول',
    en: '6+ months clinical experience in first-preference specialty',
    pts: 3,
  },
  {
    id: 'volunteer',
    ar: 'تطوع في الرعاية الصحية المجتمعية (آخر ٥ سنوات)',
    en: 'Public/community healthcare volunteering (last 5 years)',
    pts: 2,
  },
  {
    id: 'employed',
    ar: 'العمل الحالي في مؤسسة رعاية صحية',
    en: 'Currently employed at a healthcare institution',
    pts: 2,
  },
]

const SPECIALTIES = [
  { id: 'omfs',        ar: 'جراحة الفم والوجه والفكين',           en: 'Oral & Maxillofacial Surgery',                    min: 85.67 },
  { id: 'oral-med',   ar: 'طب الفم وعلم الأمراض',                en: 'Oral Medicine & Pathology',                       min: 83.62 },
  { id: 'pedo',       ar: 'طب أسنان الأطفال',                    en: 'Pediatric Dentistry',                             min: 83.53 },
  { id: 'perio',      ar: 'أمراض اللثة',                         en: 'Periodontics',                                    min: 83.39 },
  { id: 'ortho',      ar: 'تقويم الأسنان وتقويم الوجه',          en: 'Orthodontics & Dentofacial Orthopedics',          min: 83.20 },
  { id: 'family',     ar: 'طب أسنان الأسرة',                     en: 'Family Dentistry',                                min: 83.09 },
  { id: 'prostho',    ar: 'التعويضات السنية',                    en: 'Prosthodontics',                                  min: 81.53 },
  { id: 'restorative',ar: 'ترميم الأسنان',                       en: 'Restorative Dentistry',                           min: 81.33 },
  { id: 'endo',       ar: 'علاج جذور الأسنان',                   en: 'Endodontics',                                     min: 81.01 },
  { id: 'aegd',       ar: 'التدريب المتقدم في طب الأسنان العام', en: 'Advanced Education In General Dentistry',         min: 80.02 },
]

const teal = '#4A8FA3'
const cardBg = 'rgba(255,255,255,0.04)'
const border = 'rgba(255,255,255,0.08)'
const textMuted = 'rgba(255,255,255,0.5)'

function ScoreBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min((value / max) * 100, 100)}%`, background: color }}
      />
    </div>
  )
}

export default function CalculatorClient() {
  const [gpa, setGpa] = useState('')
  const [gpaMax, setGpaMax] = useState<'4' | '5'>('5')
  const [sdle, setSdle] = useState('')
  const [cvSelected, setCvSelected] = useState<Set<string>>(new Set())

  const gpaVal = parseFloat(gpa) || 0
  const sdleVal = parseFloat(sdle) || 0
  const maxGpa = parseFloat(gpaMax)

  const gpaPoints = useMemo(() => {
    if (!gpa || gpaVal <= 0) return 0
    return Math.min((gpaVal / maxGpa) * 30, 30)
  }, [gpa, gpaVal, maxGpa])

  const sdlePoints = useMemo(() => {
    if (!sdle || sdleVal <= 0) return 0
    return Math.min((sdleVal / 800) * 55, 55)
  }, [sdle, sdleVal])

  const cvPoints = useMemo(
    () => CV_CRITERIA.filter((c) => cvSelected.has(c.id)).reduce((s, c) => s + c.pts, 0),
    [cvSelected],
  )

  const total = gpaPoints + sdlePoints + cvPoints
  const hasInput = gpa !== '' || sdle !== ''

  const totalColor = total >= 83 ? '#4ade80' : total >= 80 ? '#fbbf24' : '#f87171'

  function toggleCv(id: string) {
    setCvSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const qualifyingCount = SPECIALTIES.filter((s) => total >= s.min).length

  return (
    <div className="p-6 max-w-6xl mx-auto" dir="rtl">
      {/* ── Page Header ── */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">حاسبة درجة القبول في البورد السعودي</h1>
          <p className="text-sm mt-1" style={{ color: textMuted }}>
            احسب درجتك الكلية وتعرّف على التخصصات المتاحة — وفق معادلة الهيئة السعودية للتخصصات الصحية
          </p>
        </div>
        {hasInput && (
          <div
            className="flex-shrink-0 flex flex-col items-center justify-center rounded-2xl px-6 py-3"
            style={{
              background: `${totalColor}14`,
              border: `1.5px solid ${totalColor}`,
            }}
          >
            <span className="text-4xl font-bold leading-none" style={{ color: totalColor }}>
              {total.toFixed(1)}
            </span>
            <span className="text-xs mt-1" style={{ color: textMuted }}>
              من ١٠٠
            </span>
          </div>
        )}
      </div>

      {/* ── Formula Bar ── */}
      <div
        className="rounded-xl p-4 mb-6 flex items-center justify-center gap-3 flex-wrap"
        style={{ background: 'rgba(74,143,163,0.08)', border: '1px solid rgba(74,143,163,0.22)' }}
      >
        {(
          [
            { label: 'المعدل الدراسي', pts: 30, icon: '🎓', color: teal },
            null,
            { label: 'درجة SDLE', pts: 55, icon: '📋', color: '#7BC8A4' },
            null,
            { label: 'السيرة الذاتية', pts: 15, icon: '📁', color: '#A78BFA' },
            null,
            { label: 'الإجمالي', pts: 100, icon: '🏆', color: '#fbbf24' },
          ] as ({ label: string; pts: number; icon: string; color: string } | null)[]
        ).map((item, i) =>
          item === null ? (
            <span key={i} className="text-xl font-light select-none" style={{ color: textMuted }}>
              +
            </span>
          ) : i === 6 ? (
            <div key={i} className="flex items-center gap-1">
              <span className="text-xl font-light select-none" style={{ color: textMuted }}>=</span>
              <div className="flex flex-col items-center ms-2">
                <span className="text-lg leading-none">{item.icon}</span>
                <span className="font-bold text-xl text-white leading-tight">{item.pts}</span>
                <span className="text-xs" style={{ color: textMuted }}>
                  {item.label}
                </span>
              </div>
            </div>
          ) : (
            <div key={i} className="flex flex-col items-center">
              <span className="text-lg leading-none">{item.icon}</span>
              <span className="font-bold text-xl leading-tight" style={{ color: item.color }}>
                {item.pts}
              </span>
              <span className="text-xs" style={{ color: textMuted }}>
                {item.label}
              </span>
            </div>
          ),
        )}
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── LEFT COLUMN (inputs) ── */}
        <div className="space-y-5">
          {/* GPA */}
          <div
            className="rounded-xl p-5 space-y-3"
            style={{ background: cardBg, border: `1px solid ${border}` }}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">🎓</span>
              <h2 className="text-white font-semibold text-sm">المعدل الدراسي الكلي GPA</h2>
              <span
                className="text-xs px-2 py-0.5 rounded-full ms-auto font-mono"
                style={{ background: 'rgba(74,143,163,0.15)', color: teal }}
              >
                {gpaPoints.toFixed(1)} / 30
              </span>
            </div>
            <div className="flex gap-3 items-center">
              <input
                type="number"
                value={gpa}
                onChange={(e) => setGpa(e.target.value)}
                placeholder={`0.00 – ${gpaMax}`}
                min={0}
                max={maxGpa}
                step={0.01}
                className="flex-1 rounded-lg px-4 py-2.5 text-white text-base outline-none"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: `1px solid ${border}`,
                  color: 'white',
                }}
              />
              <span className="text-sm flex-shrink-0" style={{ color: textMuted }}>
                من
              </span>
              <select
                value={gpaMax}
                onChange={(e) => setGpaMax(e.target.value as '4' | '5')}
                className="rounded-lg px-3 py-2.5 text-white text-sm outline-none"
                style={{ background: '#1e2030', border: `1px solid ${border}`, color: 'white' }}
              >
                <option value="5">5.0 — سعودي</option>
                <option value="4">4.0 — دولي</option>
              </select>
            </div>
            {gpaVal > maxGpa && gpa !== '' && (
              <p className="text-xs" style={{ color: '#f87171' }}>
                المعدل لا يتجاوز {maxGpa}
              </p>
            )}
            <ScoreBar value={gpaPoints} max={30} color={teal} />
          </div>

          {/* SDLE */}
          <div
            className="rounded-xl p-5 space-y-3"
            style={{ background: cardBg, border: `1px solid ${border}` }}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">📋</span>
              <h2 className="text-white font-semibold text-sm">درجة اختبار SDLE</h2>
              <span
                className="text-xs px-2 py-0.5 rounded-full ms-auto font-mono"
                style={{ background: 'rgba(74,143,163,0.15)', color: '#7BC8A4' }}
              >
                {sdlePoints.toFixed(1)} / 55
              </span>
            </div>
            <div className="flex gap-3 items-center">
              <input
                type="number"
                value={sdle}
                onChange={(e) => setSdle(e.target.value)}
                placeholder="200 – 800"
                min={200}
                max={800}
                className="flex-1 rounded-lg px-4 py-2.5 text-base outline-none"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: `1px solid ${border}`,
                  color: 'white',
                }}
              />
              <span className="text-sm flex-shrink-0" style={{ color: textMuted }}>
                / 800
              </span>
            </div>
            {sdleVal > 0 && sdleVal < 200 && (
              <p className="text-xs" style={{ color: '#f87171' }}>
                الحد الأدنى لدرجة الاختبار هو 200
              </p>
            )}
            {sdleVal >= 542 && (
              <p className="text-xs" style={{ color: '#4ade80' }}>
                ✓ اجتزت حد الاجتياز (542+)
              </p>
            )}
            {sdleVal > 0 && sdleVal < 542 && sdleVal >= 200 && (
              <p className="text-xs" style={{ color: '#fbbf24' }}>
                تحتاج إلى {(542 - sdleVal).toFixed(0)} نقطة إضافية للاجتياز
              </p>
            )}
            <ScoreBar value={sdlePoints} max={55} color="#7BC8A4" />
          </div>

          {/* CV Criteria */}
          <div
            className="rounded-xl p-5 space-y-3"
            style={{ background: cardBg, border: `1px solid ${border}` }}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">📁</span>
              <h2 className="text-white font-semibold text-sm">معايير السيرة الذاتية</h2>
              <span
                className="text-xs px-2 py-0.5 rounded-full ms-auto font-mono"
                style={{ background: 'rgba(167,139,250,0.15)', color: '#A78BFA' }}
              >
                {cvPoints} / 15
              </span>
            </div>
            <p className="text-xs" style={{ color: textMuted }}>
              اختر ما ينطبق عليك — الحد الأقصى ١٥ نقطة
            </p>
            <div className="space-y-2">
              {CV_CRITERIA.map((c) => {
                const checked = cvSelected.has(c.id)
                return (
                  <label
                    key={c.id}
                    className="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all"
                    style={{
                      background: checked ? 'rgba(74,143,163,0.1)' : 'rgba(255,255,255,0.025)',
                      border: `1px solid ${checked ? 'rgba(74,143,163,0.35)' : 'rgba(255,255,255,0.06)'}`,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCv(c.id)}
                      className="mt-0.5 flex-shrink-0"
                      style={{ accentColor: teal }}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-white">{c.ar}</span>
                      <span className="block text-xs mt-0.5" style={{ color: textMuted }}>
                        {c.en}
                      </span>
                    </div>
                    <span
                      className="flex-shrink-0 text-xs font-bold px-2 py-1 rounded-md"
                      style={{
                        background: checked ? 'rgba(74,143,163,0.2)' : 'rgba(255,255,255,0.07)',
                        color: checked ? teal : textMuted,
                      }}
                    >
                      +{c.pts}
                    </span>
                  </label>
                )
              })}
            </div>
            <ScoreBar value={cvPoints} max={15} color="#A78BFA" />
          </div>
        </div>

        {/* ── RIGHT COLUMN (results) ── */}
        <div className="space-y-5">
          {/* Score breakdown */}
          <div
            className="rounded-xl p-5 space-y-4"
            style={{ background: cardBg, border: `1px solid ${border}` }}
          >
            <h2 className="text-white font-semibold text-sm">تفصيل الدرجات</h2>

            {[
              { label: 'المعدل الدراسي', pts: gpaPoints, max: 30, color: teal, icon: '🎓' },
              { label: 'درجة SDLE', pts: sdlePoints, max: 55, color: '#7BC8A4', icon: '📋' },
              { label: 'السيرة الذاتية', pts: cvPoints, max: 15, color: '#A78BFA', icon: '📁' },
            ].map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{item.icon}</span>
                    <span className="text-sm text-white">{item.label}</span>
                  </div>
                  <span className="text-sm font-mono" style={{ color: item.color }}>
                    {item.pts.toFixed(1)}{' '}
                    <span style={{ color: textMuted }}>/ {item.max}</span>
                  </span>
                </div>
                <ScoreBar value={item.pts} max={item.max} color={item.color} />
              </div>
            ))}

            <div
              className="flex items-center justify-between rounded-xl px-4 py-4 mt-2"
              style={{ background: `${totalColor}0d`, border: `1px solid ${totalColor}33` }}
            >
              <span className="text-white font-semibold">المجموع الكلي</span>
              <div className="text-end">
                <span className="text-3xl font-bold leading-none" style={{ color: totalColor }}>
                  {hasInput ? total.toFixed(1) : '—'}
                </span>
                <span className="text-base ms-1" style={{ color: textMuted }}>
                  / 100
                </span>
                {hasInput && (
                  <div className="text-xs mt-0.5" style={{ color: textMuted }}>
                    {total >= 85.67
                      ? 'مؤهّل لجميع التخصصات السنية'
                      : total >= 83
                      ? 'مؤهّل لمعظم التخصصات'
                      : total >= 80
                      ? 'مؤهّل لبعض التخصصات'
                      : 'لا تزال تحتاج لرفع درجتك'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Specialty match */}
          <div
            className="rounded-xl p-5"
            style={{ background: cardBg, border: `1px solid ${border}` }}
          >
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-white font-semibold text-sm">مطابقة التخصصات السنية</h2>
              {hasInput && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full ms-auto"
                  style={{
                    background: qualifyingCount > 0 ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                    color: qualifyingCount > 0 ? '#4ade80' : '#f87171',
                  }}
                >
                  {qualifyingCount} / {SPECIALTIES.length} مؤهّل
                </span>
              )}
            </div>

            {!hasInput ? (
              <div className="py-10 text-center">
                <div className="text-4xl mb-3">🦷</div>
                <p className="text-sm" style={{ color: textMuted }}>
                  أدخل درجاتك لترى التخصصات المتاحة
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {SPECIALTIES.map((spec) => {
                  const qualifies = total >= spec.min
                  const diff = total - spec.min

                  return (
                    <div
                      key={spec.id}
                      className="flex items-center gap-3 p-3 rounded-lg"
                      style={{
                        background: qualifies
                          ? 'rgba(74,222,128,0.05)'
                          : 'rgba(248,113,113,0.05)',
                        border: `1px solid ${qualifies ? 'rgba(74,222,128,0.18)' : 'rgba(248,113,113,0.12)'}`,
                      }}
                    >
                      <span className="text-base flex-shrink-0">{qualifies ? '✅' : '❌'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white">{spec.ar}</div>
                        <div className="text-xs mt-0.5" style={{ color: textMuted }}>
                          {spec.en}
                        </div>
                      </div>
                      <div className="text-end flex-shrink-0 min-w-[52px]">
                        <div
                          className="text-xs font-mono font-semibold"
                          style={{ color: qualifies ? '#4ade80' : '#f87171' }}
                        >
                          {qualifies ? `+${diff.toFixed(2)}` : diff.toFixed(2)}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: textMuted }}>
                          حد: {spec.min}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Source note */}
          <div
            className="rounded-lg px-4 py-3 text-xs space-y-1"
            style={{ background: 'rgba(255,255,255,0.025)', border: `1px solid ${border}` }}
          >
            <p style={{ color: textMuted }}>
              <span className="text-white font-medium">المصدر: </span>
              بيانات الهيئة السعودية للتخصصات الصحية (SCFHS) — أدنى درجة ترشيح للتخصصات السنية، عام ٢٠٢٥م.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.3)' }}>
              المعادلة: (المعدل ÷ أقصى معدل × ٣٠) + (SDLE ÷ ٨٠٠ × ٥٥) + نقاط السيرة الذاتية = الإجمالي من ١٠٠
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
