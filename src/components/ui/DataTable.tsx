'use client';

import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Column<T> {
  key: string;
  header: string;
  displayKey?: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchKey?: keyof T;
  searchPlaceholder?: string;
  loading?: boolean;
  pageSize?: number;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchKey,
  searchPlaceholder = 'Search...',
  loading = false,
  pageSize = 5,
}: DataTableProps<T>) {
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Handle sorting toggles
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  // Filter & sort data
  const processedData = useMemo(() => {
    let result = [...data];

    // Filter
    if (query && searchKey) {
      result = result.filter((row) => {
        const val = row[searchKey];
        return String(val ?? '').toLowerCase().includes(query.toLowerCase());
      });
    }

    // Sort
    if (sortKey) {
      result.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];

        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;

        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortDirection === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }

        return sortDirection === 'asc'
          ? (valA > valB ? 1 : -1)
          : (valB > valA ? 1 : -1);
      });
    }

    return result;
  }, [data, query, searchKey, sortKey, sortDirection]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(processedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  // Reset page on query change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Area */}
      {searchKey && (
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={query}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-2 bg-surface border border-border-custom text-text-primary rounded-badge font-sans text-xs focus:outline-none focus:border-accent transition-colors placeholder:text-text-muted/40"
            placeholder={searchPlaceholder}
          />
        </div>
      )}

      {/* Table grid container */}
      <div className="w-full border border-border-custom rounded-card overflow-hidden bg-surface">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-custom bg-background/25">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && handleSort(col.key)}
                    className={cn(
                      'px-6 py-4 text-xs font-semibold text-text-muted font-sans uppercase tracking-wider select-none',
                      col.sortable ? 'cursor-pointer hover:text-text-primary transition-colors' : ''
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable && sortKey === col.key && (
                        <span>{sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody className="divide-y divide-border-custom">
              {loading ? (
                // Render loading skeletons
                Array.from({ length: pageSize }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {columns.map((col) => (
                      <td key={col.key} className="px-6 py-4">
                        <div className="h-4 bg-border-custom rounded w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-sm text-text-muted font-sans">
                    No records found.
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, index) => (
                  <tr
                    key={index}
                    className="hover:bg-background/20 transition-colors duration-100"
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="px-6 py-4 text-sm font-sans text-text-primary">
                        {col.render ? col.render(row) : (col.displayKey ? row[col.displayKey] : row[col.key])}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination controls */}
        <div className="px-6 py-3 border-t border-border-custom flex items-center justify-between font-mono text-[10px] text-text-muted bg-background/10">
          <div>
            Showing {processedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
            {Math.min(currentPage * pageSize, processedData.length)} of {processedData.length} records
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
              className="p-1 rounded border border-border-custom hover:bg-background/50 hover:text-text-primary disabled:opacity-40 transition-all cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-medium">
              PAGE {currentPage} OF {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || loading}
              className="p-1 rounded border border-border-custom hover:bg-background/50 hover:text-text-primary disabled:opacity-40 transition-all cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default DataTable;
