import { useMemo, useState } from 'react';
import { Card } from './primitives';
import { Icon } from './icons';

export interface ComparisonTableData {
  title: string;
  columns: string[];
  rows: { name: string; cells: (string | number | boolean)[] }[];
}

export function ComparisonTable({ data }: { data: ComparisonTableData }) {
  const [sortKey, setSortKey] = useState<number | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    let r = data.rows;
    if (query.trim()) {
      const q = query.toLowerCase();
      r = r.filter((row) => row.name.toLowerCase().includes(q) || row.cells.some((c) => String(c).toLowerCase().includes(q)));
    }
    if (sortKey !== null) {
      r = [...r].sort((a, b) => {
        const av = a.cells[sortKey];
        const bv = b.cells[sortKey];
        const an = parseFloat(String(av).replace(/[^\d.-]/g, ''));
        const bn = parseFloat(String(bv).replace(/[^\d.-]/g, ''));
        if (!Number.isNaN(an) && !Number.isNaN(bn)) {
          return sortDir === 'asc' ? an - bn : bn - an;
        }
        return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
      });
    }
    return r;
  }, [data.rows, query, sortKey, sortDir]);

  const onSort = (i: number) => {
    if (sortKey === i) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(i); setSortDir('asc'); }
  };

  return (
    <Card padded={false} className="overflow-hidden">
      <div className="flex items-center justify-between gap-3 p-4 border-b border-ink-100 dark:border-ink-700">
        <h3 className="font-semibold text-ink-900 dark:text-ink-100">{data.title}</h3>
        <div className="relative">
          <Icon.Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-ink-400 dark:text-ink-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter…"
            className="text-sm rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 text-ink-900 dark:text-ink-100 pl-8 pr-3 py-1.5 outline-none focus:border-ink-400 dark:focus:border-ink-500 placeholder:text-ink-400 dark:placeholder:text-ink-500"
          />
        </div>
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-ink-50/40 dark:bg-ink-800/50">
              {data.columns.map((col, i) => (
                <th
                  key={col}
                  onClick={() => onSort(i)}
                  className="text-left text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wide px-4 py-2.5 cursor-pointer select-none hover:bg-ink-50 dark:hover:bg-ink-700"
                >
                  <span className="inline-flex items-center gap-1">
                    {col}
                    {sortKey === i && (sortDir === 'asc' ? <Icon.ArrowUp className="w-3 h-3" /> : <Icon.ArrowDown className="w-3 h-3" />)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name} className="border-t border-ink-100 dark:border-ink-700 hover:bg-ink-50/30 dark:hover:bg-ink-700/30 transition">
                <td className="px-4 py-3 font-medium text-ink-900 dark:text-ink-100 whitespace-nowrap">{row.name}</td>
                {row.cells.map((c, i) => (
                  <td key={i} className="px-4 py-3 text-ink-700 dark:text-ink-300">
                    {typeof c === 'boolean' ? (c ? <Icon.Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Icon.X className="w-4 h-4 text-ink-300 dark:text-ink-500" />) : c}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={data.columns.length} className="px-4 py-8 text-center text-sm text-ink-500 dark:text-ink-400">No matches.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
