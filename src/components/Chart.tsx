import { useMemo, useState } from 'react';
import { Card } from './primitives';
import type { ChartData } from '../types';
import { Icon } from './icons';

const W = 360;
const H = 280;

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

  const total = pieSlices.reduce((sum, s) => sum + s.value, 0);

  return (
    <Card padded={false} className="overflow-hidden">
      <div className="px-4 py-3 border-b border-ink-100 dark:border-ink-700">
        <h3 className="font-semibold text-sm text-ink-900 dark:text-ink-100">{data.title}</h3>
      </div>

      <div className="p-4">
        {data.kind === 'pie' && pieSlices.length > 0 ? (
          <>
            <div className="relative">
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" role="img" aria-label={data.title}>
                {pieSlices.map((slice) => (
                  <g key={slice.idx}>
                    <path
                      d={slice.path}
                      fill={slice.color}
                      stroke="white"
                      strokeWidth={2}
                      className="cursor-pointer transition-opacity duration-150"
                      style={{ opacity: hover === null || hover === slice.idx ? 1 : 0.5 }}
                      onMouseEnter={() => setHover(slice.idx)}
                      onMouseLeave={() => setHover(null)}
                    />
                    {slice.pct >= 6 && (
                      <text
                        x={slice.labelX}
                        y={slice.labelY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="11"
                        fill="white"
                        fontWeight="600"
                        style={{ pointerEvents: 'none' }}
                      >
                        {slice.pct}%
                      </text>
                    )}
                  </g>
                ))}
              </svg>

              {hover !== null && pieSlices[hover] && (
                <div className="absolute top-1 left-1 right-1 text-center pointer-events-none">
                  <div className="inline-block bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-lg px-3 py-1.5 shadow-sm">
                    <p className="text-xs font-semibold text-ink-900 dark:text-ink-100">{pieSlices[hover].label}</p>
                    <p className="text-xs text-ink-500 dark:text-ink-400">
                      {pieSlices[hover].value} ({pieSlices[hover].pct}%)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="mt-3 pt-3 border-t border-ink-100 dark:border-ink-700 space-y-1.5">
              {pieSlices.map((slice) => (
                <div
                  key={slice.idx}
                  className={`flex items-center gap-2 text-xs cursor-pointer transition-opacity ${
                    hover === null || hover === slice.idx ? 'opacity-100' : 'opacity-50'
                  }`}
                  onMouseEnter={() => setHover(slice.idx)}
                  onMouseLeave={() => setHover(null)}
                >
                  <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: slice.color }} />
                  <span className="flex-1 text-ink-700 dark:text-ink-300 truncate">{slice.label}</span>
                  <span className="font-medium text-ink-900 dark:text-ink-100 tabular-nums">
                    {Math.round((slice.value / total) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-40 text-sm text-ink-500 dark:text-ink-400">
            <Icon.EyeOff className="w-4 h-4 mr-2" />
            No data available
          </div>
        )}
      </div>
    </Card>
  );
}

export { Icon };
