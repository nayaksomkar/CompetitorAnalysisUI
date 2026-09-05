import { useMemo, useState } from 'react';
import { Card } from './primitives';
import type { ChartData } from '../types';
import { Icon } from './icons';

const W = 360;
const H = 280;
const PALETTE = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

export function Chart({ data }: { data: ChartData }) {
  const [hover, setHover] = useState<number | null>(null);

  const pieSlices = useMemo(() => {
    if (data.kind !== 'pie' || data.series.length === 0) return [];
    const series = data.series[0];
    const total = series.points.reduce((sum, p) => sum + p.value, 0);
    if (total === 0) return [];
    const cx = W / 2;
    const cy = H / 2;
    const radius = Math.min(W, H) / 2 - 20;
    let startAngle = -Math.PI / 2;
    return series.points.map((point, idx) => {
      const sliceAngle = (point.value / total) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;
      const x1 = cx + radius * Math.cos(startAngle);
      const y1 = cy + radius * Math.sin(startAngle);
      const x2 = cx + radius * Math.cos(endAngle);
      const y2 = cy + radius * Math.sin(endAngle);
      const largeArc = sliceAngle > Math.PI ? 1 : 0;
      const path = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      const midAngle = startAngle + sliceAngle / 2;
      const labelRadius = radius * 0.7;
      const labelX = cx + labelRadius * Math.cos(midAngle);
      const labelY = cy + labelRadius * Math.sin(midAngle);
      const pct = Math.round((point.value / total) * 100);
      startAngle = endAngle;
      return { path, color: point.color ?? series.color, label: point.label, value: point.value, pct, labelX, labelY, idx };
    });
  }, [data]);

  const pieTotal = pieSlices.reduce((sum, s) => sum + s.value, 0);

  if (data.kind === 'pie' && pieSlices.length > 0) {
    return (
      <ChartCard title={data.title}>
        <div className="relative">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" role="img" aria-label={data.title}>
            {pieSlices.map((slice) => (
              <g key={slice.idx}>
                <path d={slice.path} fill={slice.color} stroke="white" strokeWidth={2}
                  className="cursor-pointer transition-opacity duration-150"
                  style={{ opacity: hover === null || hover === slice.idx ? 1 : 0.5 }}
                  onMouseEnter={() => setHover(slice.idx)} onMouseLeave={() => setHover(null)} />
                {slice.pct >= 6 && (
                  <text x={slice.labelX} y={slice.labelY} textAnchor="middle" dominantBaseline="middle"
                    fontSize="11" fill="white" fontWeight="600" style={{ pointerEvents: 'none' }}>{slice.pct}%</text>
                )}
              </g>
            ))}
          </svg>
          {hover !== null && pieSlices[hover] && (
            <div className="absolute top-1 left-1 right-1 text-center pointer-events-none">
              <div className="inline-block bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-lg px-3 py-1.5 shadow-sm">
                <p className="text-xs font-semibold text-ink-900 dark:text-ink-100">{pieSlices[hover].label}</p>
                <p className="text-xs text-ink-500 dark:text-ink-400">{pieSlices[hover].value} ({pieSlices[hover].pct}%)</p>
              </div>
            </div>
          )}
        </div>
        <div className="mt-3 pt-3 border-t border-ink-100 dark:border-ink-700 space-y-1.5">
          {pieSlices.map((slice) => (
            <div key={slice.idx}
              className={`flex items-center gap-2 text-xs cursor-pointer transition-opacity ${hover === null || hover === slice.idx ? 'opacity-100' : 'opacity-50'}`}
              onMouseEnter={() => setHover(slice.idx)} onMouseLeave={() => setHover(null)}>
              <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: slice.color }} />
              <span className="flex-1 text-ink-700 dark:text-ink-300 truncate">{slice.label}</span>
              <span className="font-medium text-ink-900 dark:text-ink-100 tabular-nums">{Math.round((slice.value / pieTotal) * 100)}%</span>
            </div>
          ))}
        </div>
      </ChartCard>
    );
  }

  if (data.kind === 'bar') return <BarChart data={data} hover={hover} setHover={setHover} />;
  if (data.kind === 'radar') return <RadarChart data={data} hover={hover} setHover={setHover} />;
  if (data.kind === 'line') return <LineAreaChart data={data} filled={false} hover={hover} setHover={setHover} />;
  if (data.kind === 'area') return <LineAreaChart data={data} filled={true} hover={hover} setHover={setHover} />;

  return (
    <ChartCard title={data.title}>
      <div className="flex items-center justify-center h-40 text-sm text-ink-500 dark:text-ink-400">
        <Icon.EyeOff className="w-4 h-4 mr-2" />No data available
      </div>
    </ChartCard>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card padded={false} className="overflow-hidden">
      <div className="px-4 py-3 border-b border-ink-100 dark:border-ink-700">
        <h3 className="font-semibold text-sm text-ink-900 dark:text-ink-100">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </Card>
  );
}

function BarChart({ data, hover, setHover }: { data: ChartData; hover: number | null; setHover: (v: number | null) => void }) {
  const series = data.series;
  const maxVal = Math.max(1, ...series.flatMap((s) => s.points.map((p) => p.value)));
  const padL = 40;
 const padB = 40;
 const padT = 10;
 const padR = 10;
 const chartW = W - padL - padR;
 const chartH = H - padT - padB;
 const groupW = chartW / (series[0]?.points.length || 1);
 const barW = Math.min(28, (groupW * 0.7) / series.length);

  return (
    <ChartCard title={data.title}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" role="img" aria-label={data.title}>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = padT + chartH * (1 - t);
          const val = Math.round(maxVal * t);
          return (
            <g key={t}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="currentColor" strokeOpacity={0.1} />
              <text x={padL - 6} y={y + 3} textAnchor="end" fontSize="9" fill="currentColor" opacity={0.5}>{val}</text>
            </g>
          );
        })}
        {series[0]?.points.map((_, pi) => {
          const cx = padL + groupW * (pi + 0.5);
          return (
            <text key={pi} x={cx} y={H - 8} textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.6}>
              {series[0].points[pi].label}
            </text>
          );
        })}
        {series.map((s, si) =>
          s.points.map((p, pi) => {
            const h = (p.value / maxVal) * chartH;
            const x = padL + groupW * pi + (groupW * 0.15) + si * barW;
            const y = padT + chartH - h;
            const color = p.color ?? PALETTE[si % PALETTE.length];
            const gIdx = si * 1000 + pi;
            return (
              <rect key={gIdx} x={x} y={y} width={barW} height={h} rx={3} fill={color}
                opacity={hover === null || hover === gIdx ? 1 : 0.4}
                onMouseEnter={() => setHover(gIdx)} onMouseLeave={() => setHover(null)} />
            );
          })
        )}
      </svg>
      <Legend series={series} hover={hover} setHover={setHover} />
    </ChartCard>
  );
}

function RadarChart({ data, hover, setHover }: { data: ChartData; hover: number | null; setHover: (v: number | null) => void }) {
  const series = data.series;
  const dims = series[0]?.points ?? [];
  const n = dims.length;
  const cx = W / 2;
  const cy = H / 2;
  const radius = Math.min(W, H) / 2 - 36;
  const levels = 4;

  if (n < 3 || series.length === 0) {
    return (
      <ChartCard title={data.title}>
        <div className="flex items-center justify-center h-40 text-sm text-ink-500 dark:text-ink-400">
          <Icon.EyeOff className="w-4 h-4 mr-2" />Not enough dimensions for radar
        </div>
      </ChartCard>
    );
  }

  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i: number, r: number) => [cx + r * Math.cos(angle(i)), cy + r * Math.sin(angle(i))];

  return (
    <ChartCard title={data.title}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" role="img" aria-label={data.title}>
        {Array.from({ length: levels }, (_, li) => {
          const r = (radius * (li + 1)) / levels;
          return (
            <polygon key={li} points={dims.map((_, i) => pt(i, r).join(',')).join(' ')}
              fill="none" stroke="currentColor" strokeOpacity={0.1} />
          );
        })}
        {dims.map((_, i) => {
          const [x, y] = pt(i, radius);
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="currentColor" strokeOpacity={0.1} />;
        })}
        {dims.map((d, i) => {
          const [x, y] = pt(i, radius + 12);
          return <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
            fontSize="9" fill="currentColor" opacity={0.7}>{d.label}</text>;
        })}
        {series.map((s, si) => {
          const pts = s.points.map((p, i) => {
            const r = (p.value / 100) * radius;
            return pt(i, r).join(',');
          }).join(' ');
          const color = s.color ?? PALETTE[si % PALETTE.length];
          return (
            <g key={si} onMouseEnter={() => setHover(si)} onMouseLeave={() => setHover(null)}>
              <polygon points={pts} fill={color} fillOpacity={hover === si ? 0.35 : 0.1}
                stroke={color} strokeWidth={2} opacity={hover === null || hover === si ? 1 : 0.4} />
              {s.points.map((p, i) => {
                const r = (p.value / 100) * radius;
                const [x, y] = pt(i, r);
                return <circle key={i} cx={x} cy={y} r={3} fill={color} />;
              })}
            </g>
          );
        })}
      </svg>
      <Legend series={series} hover={hover} setHover={setHover} />
    </ChartCard>
  );
}

function LineAreaChart({
  data, filled, hover, setHover,
}: { data: ChartData; filled: boolean; hover: number | null; setHover: (v: number | null) => void }) {
  const series = data.series;
  const labels = series[0]?.points.map((p) => p.label) ?? [];
  const maxVal = Math.max(1, ...series.flatMap((s) => s.points.map((p) => p.value)));
  const padL = 40;
 const padB = 36;
 const padT = 10;
 const padR = 10;
 const chartW = W - padL - padR;
 const chartH = H - padT - padB;
 const stepX = labels.length > 1 ? chartW / (labels.length - 1) : chartW;

  const toPoint = (p: { value: number }, i: number) => [padL + stepX * i, padT + chartH - (p.value / maxVal) * chartH];

  return (
    <ChartCard title={data.title}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" role="img" aria-label={data.title}>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = padT + chartH * (1 - t);
          return (
            <g key={t}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="currentColor" strokeOpacity={0.1} />
              <text x={padL - 6} y={y + 3} textAnchor="end" fontSize="9" fill="currentColor" opacity={0.5}>
                {Math.round(maxVal * t)}
              </text>
            </g>
          );
        })}
        {labels.map((l, i) => (
          <text key={i} x={padL + stepX * i} y={H - 8} textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.6}>{l}</text>
        ))}
        {series.map((s, si) => {
          const pts = s.points.map(toPoint);
          const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
          const color = s.color ?? PALETTE[si % PALETTE.length];
          const area = `${line} L ${pts[pts.length - 1][0]} ${padT + chartH} L ${pts[0][0]} ${padT + chartH} Z`;
          return (
            <g key={si} onMouseEnter={() => setHover(si)} onMouseLeave={() => setHover(null)} opacity={hover === null || hover === si ? 1 : 0.3}>
              {filled && <path d={area} fill={color} fillOpacity={0.2} />}
              <path d={line} fill="none" stroke={color} strokeWidth={2} />
              {pts.map(([x, y], pi) => <circle key={pi} cx={x} cy={y} r={3} fill={color} />)}
            </g>
          );
        })}
      </svg>
      <Legend series={series} hover={hover} setHover={setHover} />
    </ChartCard>
  );
}

function Legend({ series, hover, setHover }: { series: { name: string; color?: string }[]; hover: number | null; setHover: (v: number | null) => void }) {
  return (
    <div className="mt-3 pt-3 border-t border-ink-100 dark:border-ink-700 flex flex-wrap gap-x-4 gap-y-1.5">
      {series.map((s, si) => (
        <div key={si}
          className={`flex items-center gap-1.5 text-xs cursor-pointer transition-opacity ${hover === null || hover === si ? 'opacity-100' : 'opacity-50'}`}
          onMouseEnter={() => setHover(si)} onMouseLeave={() => setHover(null)}>
          <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: s.color ?? PALETTE[si % PALETTE.length] }} />
          <span className="text-ink-700 dark:text-ink-300">{s.name}</span>
        </div>
      ))}
    </div>
  );
}

export { Icon };
