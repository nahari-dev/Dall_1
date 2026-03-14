'use client'

interface GaugeProps {
  value: number
  min?: number
  max?: number
  size?: number
  strokeWidth?: number
  color?: string
}

export default function Gauge({
  value,
  min = 200,
  max = 800,
  size = 120,
  strokeWidth = 10,
  color = '#4A8FA3',
}: GaugeProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = Math.PI * radius
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)))
  const offset = circumference * (1 - pct)

  return (
    <svg width={size} height={size / 2 + strokeWidth} className="overflow-visible">
      {/* Track */}
      <path
        d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Fill */}
      <path
        d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
    </svg>
  )
}
