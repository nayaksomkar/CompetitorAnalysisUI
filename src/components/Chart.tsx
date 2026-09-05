import { useEffect, useMemo, useState } from 'react';
import { Card } from './primitives';
import type { ChartData } from '../types';
import { Icon } from './icons';

const W = 400;
const H = 320;

export function Chart({ data }: { data: ChartData }) {
  const [hover, setHover] = useState<{ seriesId: string; pointIndex: number; x: number; y: number } | null>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const pieSlices = useMemo(() => {
    if (data.kind !== 'pie' || data.series.length === 0) return [];
    const series = data.series[0];
    const total = series.points.reduce((sum, p) => sum + p.value, 0);
    if (total === 0) return [];
    const cx = W / 2;
    const cy = H / 2;
    const radius = Math.min(W, H) / 2 - 30;
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
      const labelRadius = radius * 0.65;
      const labelX = cx + labelRadius * Math.cos(midAngle);
      const labelY = cy + labelRadius * Math.sin(midAngle);
      const pct = Math.round((point.value / total) * 100);
      startAngle = endAngle;
      return {
        path,
        color: point.color ?? series.color,
        label: point.label,
        value: point.value,
        pct,
        labelX,
        labelY,
        idx,
      };
    });
  }, [data]);

  return (
    <Card padded={false} className="overflow-hidden">
      <div className="flex items-center justify-between gap-3 p-4 border-b border-ink-100 dark:border-ink-700 flex-wrap">
        <h3 className="font-semibold text-ink-900 dark:text-ink-100">{data.title}</h3>
      </div>

      <div className="p-4">
        <div className="relative">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={data.title}>
            {/* PIE CHART */}
            {data.kind === 'pie' && (
              <>
                {pieSlices.map((slice) => (
                  <g key={slice.idx} className={animated ? 'animate-pie-in' : 'opacity-0'} style={{ animationDelay: `${slice.idx * 80}ms` }}>
                    <path
                      d={slice.path}
                      fill={slice.color}
                      stroke="white"
                      strokeWidth={2}
                      className="cursor-pointer dark:stroke-ink-800"
                      onMouseEnter={() => setHover({ seriesId: 's', pointIndex: slice.idx, x: slice.labelX, y: slice.labelY })}
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
          </svg>

          {hover && data.kind === 'pie' && (
            <div
              className="absolute pointer-events-none -translate-x-1/2 -translate-y-full -mt-2 bg-ink-900 text-white text-xs rounded-lg px-2.5 py-1.5 shadow-lg whitespace-nowrap"
              style={{ left: `${(hover.x / W) * 100}%`, top: `${(hover.y / H) * 100}%` }}
            >
              <p className="font-semibold">{pieSlices[hover.pointIndex]?.label}</p>
              <p className="opacity-80">
                {pieSlices[hover.pointIndex]?.value} ({pieSlices[hover.pointIndex]?.pct}%)
              </p>
            </div>
          )}
        </div>

        {/* Legend */}
        {data.kind === 'pie' && data.series[0] && (
          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 px-2">
            {data.series[0].points.map((p, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-ink-700 dark:text-ink-300">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: p.color ?? data.series[0].color }} />
                <span>{p.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {data.kind !== 'pie' && (
        <div className="px-4 pb-4 text-sm text-ink-500 dark:text-ink-400 flex items-center gap-2">
          <Icon.EyeOff />
          Chart type not supported.
        </div>
      )}
    </Card>
  );
}

export { Icon };
