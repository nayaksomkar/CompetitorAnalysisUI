import { useEffect, useMemo, useState } from 'react';
import { Card } from './primitives';
import type { ChartData } from '../types';
import { Icon } from './icons';

const W = 640;
const H = 300;
const PAD = { l: 16, r: 16, t: 16, b: 36 };

export function Chart({ data }: { data: ChartData }) {
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [hover, setHover] = useState<{ seriesId: string; pointIndex: number; x: number; y: number } | null>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const visibleSeries = useMemo(
    () => data.series.filter((s) => !hidden.has(s.id)),
    [data.series, hidden]
  );

  const xLabels = data.series[0]?.points.map((p) => p.label) ?? [];
  const allValues = visibleSeries.flatMap((s) => s.points.map((p) => p.value));
  const rawMax = Math.max(...allValues, 1);
  const yMax = rawMax <= 10 ? Math.ceil(rawMax * 1.2) : Math.ceil(rawMax / 10) * 10 + (rawMax > 100 ? Math.pow(10, Math.floor(Math.log10(rawMax)) - 1) * 2 : 10);
  const xCount = xLabels.length;

  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const xStep = xCount > 0 ? innerW / Math.max(1, xCount - 1) : innerW;
  const yScale = (v: number) => PAD.t + innerH - (v / yMax) * innerH;
  const xScale = (i: number) => PAD.l + (xCount > 1 ? i * xStep : innerW / 2);

  const yTicks = useMemo(() => {
    const n = 4;
    const step = yMax / n;
    const arr: number[] = [];
    for (let i = 0; i <= n; i++) {
      const val = step * i;
      arr.push(yMax <= 10 ? Math.round(val * 10) / 10 : Math.round(val));
    }
    return arr;
  }, [yMax]);

  const pieSlices = useMemo(() => {
    if (data.kind !== 'pie' || visibleSeries.length === 0) return [];
    const series = visibleSeries[0];
    const total = series.points.reduce((sum, p) => sum + p.value, 0);
    if (total === 0) return [];
    const cx = W / 2;
    const cy = H / 2 + 10;
    const radius = Math.min(innerW, innerH) / 2 - 10;
    let startAngle = -Math.PI / 2;
    return series.points.map((point) => {
      const sliceAngle = (point.value / total) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;
      const x1 = cx + radius * Math.cos(startAngle);
      const y1 = cy + radius * Math.sin(startAngle);
      const x2 = cx + radius * Math.cos(endAngle);
      const y2 = cy + radius * Math.sin(endAngle);
      const largeArc = sliceAngle > Math.PI ? 1 : 0;
      const path = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      const midAngle = startAngle + sliceAngle / 2;
      const labelRadius = radius * 0.65;
      const labelX = cx + labelRadius * Math.cos(midAngle);
      const labelY = cy + labelRadius * Math.sin(midAngle);
      const pct = Math.round((point.value / total) * 100);
      startAngle = endAngle;
      return { path, color: point.color ?? series.color, label: point.label, value: point.value, pct, labelX, labelY };
    });
  }, [data.kind, visibleSeries]);

  const radarConfig = useMemo(() => {
    if (data.kind !== 'radar') return null;
    const cx = W / 2;
    const cy = H / 2 + 10;
    const radius = Math.min(innerW, innerH) / 2 - 40;
    const n = xCount;
    if (n < 3) return null;
    const angleStep = (2 * Math.PI) / n;
    const gridLevels = 4;
    return { cx, cy, radius, n, angleStep, gridLevels };
  }, [data.kind, xCount]);

  const getPathLength = (points: { value: number }[]) => {
    let length = 0;
    for (let i = 1; i < points.length; i++) {
      const dx = xScale(i) - xScale(i - 1);
      const dy = yScale(points[i].value) - yScale(points[i - 1].value);
      length += Math.sqrt(dx * dx + dy * dy);
    }
    return length;
  };

  return (
    <Card padded={false} className="overflow-hidden">
      <div className="flex items-center justify-between gap-3 p-4 border-b border-ink-100 dark:border-ink-700 flex-wrap">
        <div>
          <h3 className="font-semibold text-ink-900 dark:text-ink-100">{data.title}</h3>
        </div>
        {data.kind !== 'pie' && (
          <div className="flex items-center gap-2 flex-wrap">
            {data.series.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  const next = new Set(hidden);
                  next.has(s.id) ? next.delete(s.id) : next.add(s.id);
                  setHidden(next);
                }}
                className={`inline-flex items-center gap-2 text-xs rounded-full border px-2.5 py-1 ${hidden.has(s.id) ? 'opacity-40' : ''} border-ink-200 dark:border-ink-600 hover:border-ink-300 dark:hover:border-ink-500 text-ink-700 dark:text-ink-300`}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                {s.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="relative">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={data.title}>
            {/* PIE CHART */}
            {data.kind === 'pie' && (
              <>
                {pieSlices.map((slice, idx) => (
                  <g key={idx} className={animated ? 'animate-pie-in' : 'opacity-0'} style={{ animationDelay: `${idx * 80}ms` }}>
                    <path
                      d={slice.path}
                      fill={slice.color}
                      stroke="white"
                      strokeWidth={2}
                      className="cursor-pointer dark:stroke-ink-800"
                      onMouseEnter={() => setHover({ seriesId: visibleSeries[0]?.id ?? '', pointIndex: idx, x: slice.labelX, y: slice.labelY })}
                      onMouseLeave={() => setHover(null)}
                    />
                    {slice.pct >= 5 && (
                      <text x={slice.labelX} y={slice.labelY} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="white" fontWeight="600">
                        {slice.pct}%
                      </text>
                    )}
                  </g>
                ))}
              </>
            )}

            {/* RADAR CHART */}
            {data.kind === 'radar' && radarConfig && (() => {
              const { cx, cy, radius, n, angleStep, gridLevels } = radarConfig;
              return (
                <g className={animated ? 'animate-radar-in' : 'opacity-0'}>
                  {Array.from({ length: gridLevels }, (_, level) => {
                    const r = (radius * (level + 1)) / gridLevels;
                    const points = Array.from({ length: n }, (_, i) => {
                      const angle = i * angleStep - Math.PI / 2;
                      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
                    }).join(' ');
                    return (
                      <polygon key={`grid-${level}`} points={points} fill="none" stroke="#e5e7eb" className="dark:stroke-ink-600" strokeWidth={1} />
                    );
                  })}
                  {Array.from({ length: n }, (_, i) => {
                    const angle = i * angleStep - Math.PI / 2;
                    return (
                      <line key={`axis-${i}`} x1={cx} y1={cy} x2={cx + radius * Math.cos(angle)} y2={cy + radius * Math.sin(angle)} stroke="#d1d5db" className="dark:stroke-ink-600" strokeWidth={1} />
                    );
                  })}
                  {xLabels.map((label, i) => {
                    const angle = i * angleStep - Math.PI / 2;
                    const labelR = radius + 20;
                    return (
                      <text key={`label-${i}`} x={cx + labelR * Math.cos(angle)} y={cy + labelR * Math.sin(angle)} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#6b7280" className="dark:fill-ink-400">
                        {label}
                      </text>
                    );
                  })}
                  {visibleSeries.map((s) => {
                    const pts = s.points.map((p, i) => {
                      const angle = i * angleStep - Math.PI / 2;
                      const r = (p.value / yMax) * radius;
                      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
                    }).join(' ');
                    return (
                      <g key={s.id}>
                        <polygon points={pts} fill={s.color} fillOpacity={0.15} stroke={s.color} strokeWidth={2} />
                        {s.points.map((p, i) => {
                          const angle = i * angleStep - Math.PI / 2;
                          const r = (p.value / yMax) * radius;
                          const px = cx + r * Math.cos(angle);
                          const py = cy + r * Math.sin(angle);
                          return (
                            <circle key={i} cx={px} cy={py} r={4} fill="white" className="dark:fill-ink-800" stroke={s.color} strokeWidth={2} onMouseEnter={() => setHover({ seriesId: s.id, pointIndex: i, x: px, y: py })} onMouseLeave={() => setHover(null)} />
                          );
                        })}
                      </g>
                    );
                  })}
                </g>
              );
            })()}

            {/* LINE / AREA CHART */}
            {(data.kind === 'line' || data.kind === 'area') && (
              <>
                {yTicks.map((t) => (
                  <g key={t}>
                    <line x1={PAD.l} x2={W - PAD.r} y1={yScale(t)} y2={yScale(t)} stroke="#eef0f3" className="dark:stroke-ink-700" />
                    <text x={PAD.l - 8} y={yScale(t) + 3} textAnchor="end" fontSize="10" fill="#8e8ea0" className="dark:fill-ink-400">{t}</text>
                  </g>
                ))}
                {xLabels.map((l, i) => (
                  <text key={l} x={xScale(i)} y={H - 10} textAnchor="middle" fontSize="10" fill="#8e8ea0" className="dark:fill-ink-400">{l}</text>
                ))}
                {visibleSeries.map((s, sIdx) => {
                  const path = s.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(p.value)}`).join(' ');
                  const areaPath = `${path} L ${xScale(s.points.length - 1)} ${yScale(0)} L ${xScale(0)} ${yScale(0)} Z`;
                  const pathLength = getPathLength(s.points);
                  return (
                    <g key={s.id}>
                      {data.kind === 'area' && (
                        <path d={areaPath} fill={s.color} fillOpacity={0.12} className={animated ? 'animate-fade-up' : 'opacity-0'} style={{ animationDelay: `${sIdx * 100}ms` }} />
                      )}
                      <path d={path} fill="none" stroke={s.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ '--path-length': pathLength } as React.CSSProperties} className={animated ? 'animate-line-draw' : ''} />
                      {s.points.map((p, i) => (
                        <circle key={i} cx={xScale(i)} cy={yScale(p.value)} r={4} fill="white" className={`dark:fill-ink-800 ${animated ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: `${i * 50 + sIdx * 100}ms` }} stroke={s.color} strokeWidth={2} onMouseEnter={() => setHover({ seriesId: s.id, pointIndex: i, x: xScale(i), y: yScale(p.value) })} onMouseLeave={() => setHover(null)} />
                      ))}
                    </g>
                  );
                })}
              </>
            )}

            {/* BAR CHART */}
            {data.kind === 'bar' && (
              <>
                {yTicks.map((t) => (
                  <line key={t} x1={PAD.l} x2={W - PAD.r} y1={yScale(t)} y2={yScale(t)} stroke="#eef0f3" className="dark:stroke-ink-700" />
                ))}
                {xLabels.map((l, i) => (
                  <text key={l} x={xScale(i)} y={H - 10} textAnchor="middle" fontSize="10" fill="#8e8ea0" className="dark:fill-ink-400">{l}</text>
                ))}
                {visibleSeries.map((s, sIdx) => {
                  const groupW = innerW / Math.max(1, s.points.length);
                  const barW = Math.max(8, Math.min(36, groupW * 0.5));
                  return (
                    <g key={s.id}>
                      {s.points.map((p, i) => {
                        const cx = xScale(i);
                        const x = cx - barW / 2 + (sIdx - (visibleSeries.length - 1) / 2) * (barW / visibleSeries.length);
                        const h = (p.value / yMax) * innerH;
                        return (
                          <rect key={i} x={x} y={yScale(p.value)} width={barW / Math.max(1, visibleSeries.length)} height={h} fill={s.color} rx={3} opacity={0.85} onMouseEnter={() => setHover({ seriesId: s.id, pointIndex: i, x: cx, y: yScale(p.value) })} onMouseLeave={() => setHover(null)} className={animated ? 'animate-bar-grow' : ''} style={{ animationDelay: `${i * 60 + sIdx * 100}ms` }} />
                        );
                      })}
                    </g>
                  );
                })}
              </>
            )}
          </svg>

          {hover && (
            <div
              className="absolute pointer-events-none -translate-x-1/2 -translate-y-full -mt-2 bg-ink-900 dark:bg-ink-100 text-white dark:text-ink-900 text-xs rounded-lg px-2.5 py-1.5 shadow-lg whitespace-nowrap"
              style={{ left: `${(hover.x / W) * 100}%`, top: `${(hover.y / H) * 100}%` }}
            >
              <p className="font-semibold">{xLabels[hover.pointIndex]}</p>
              <p className="opacity-80">
                {data.series.find((s) => s.id === hover.seriesId)?.name}: {data.series.find((s) => s.id === hover.seriesId)?.points[hover.pointIndex].value}
                {data.kind === 'pie' && ` (${Math.round((data.series.find((s) => s.id === hover.seriesId)?.points[hover.pointIndex].value ?? 0) / data.series[0].points.reduce((sum, p) => sum + p.value, 0) * 100)}%)`}
              </p>
            </div>
          )}
        </div>
      </div>

      {data.kind === 'pie' && data.series[0] && (
        <div className="px-4 pb-4 flex flex-wrap gap-3">
          {data.series[0].points.map((p, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: data.series[0].color }} />
              <span className="text-ink-700 dark:text-ink-300">{p.label}: {p.value}</span>
            </div>
          ))}
        </div>
      )}

      {visibleSeries.length === 0 && (
        <div className="px-4 pb-4 text-sm text-ink-500 dark:text-ink-400 flex items-center gap-2">
          <Icon.EyeOff />
          All series hidden — click a legend item to restore.
        </div>
      )}
    </Card>
  );
}

export { Icon };
