'use client';

import { useState, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
} from 'lucide-react';
import { Skeleton } from './skeleton';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

export type SortDirection = 'asc' | 'desc' | null;

export interface SortState {
  key: string | null;
  direction: SortDirection;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onSearch?: (query: string) => void;
  onSort?: (key: string, direction: SortDirection) => void;
  searchPlaceholder?: string;
  emptyMessage?: string;
  actions?: (item: T) => React.ReactNode;
  skeletonRows?: number;
}

function TableSkeleton({
  columns,
  rows,
  hasActions,
}: {
  columns: number;
  rows: number;
  hasActions: boolean;
}) {
  const totalCols = columns + (hasActions ? 1 : 0);

  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b last:border-0">
          {Array.from({ length: totalCols }).map((_, colIndex) => (
            <td key={colIndex} className="px-4 py-3">
              <Skeleton
                className={cn(
                  'h-4',
                  colIndex === 0 ? 'w-20' : 'w-full max-w-[120px]',
                  colIndex === totalCols - 1 && hasActions && 'ml-auto w-16'
                )}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function DataTable<T extends { id: number | string }>({
  columns,
  data,
  isLoading = false,
  totalItems = 0,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  onSearch,
  onSort,
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'Nenhum registro encontrado',
  actions,
  skeletonRows = 5,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortState, setSortState] = useState<SortState>({ key: null, direction: null });

  const totalPages = Math.ceil(totalItems / pageSize);
  const startItem = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const handleSort = useCallback(
    (columnKey: string) => {
      let newDirection: SortDirection = 'asc';
      if (sortState.key === columnKey) {
        if (sortState.direction === 'asc') newDirection = 'desc';
        else if (sortState.direction === 'desc') newDirection = null;
      }

      setSortState({ key: newDirection ? columnKey : null, direction: newDirection });
      onSort?.(columnKey, newDirection);
    },
    [sortState, onSort]
  );

  const getSortIcon = (columnKey: string) => {
    if (sortState.key !== columnKey) {
      return <ArrowUpDown className="h-4 w-4 opacity-50" />;
    }
    if (sortState.direction === 'asc') {
      return <ArrowUp className="h-4 w-4 text-primary" />;
    }
    if (sortState.direction === 'desc') {
      return <ArrowDown className="h-4 w-4 text-primary" />;
    }
    return <ArrowUpDown className="h-4 w-4 opacity-50" />;
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      {onSearch && (
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className={cn(
                'w-full rounded-lg border bg-background pl-9 pr-4 py-2 text-sm outline-none',
                'transition-all duration-150',
                'focus:ring-2 focus:ring-primary focus:border-primary'
              )}
            />
          </div>
          <button
            type="submit"
            className={cn(
              'rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground',
              'transition-all duration-150',
              'hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
            )}
          >
            Buscar
          </button>
        </form>
      )}

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      'px-4 py-3 text-left text-sm font-medium text-muted-foreground',
                      column.className
                    )}
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        onClick={() => handleSort(column.key)}
                        className={cn(
                          'flex items-center gap-1 -ml-1 px-1 rounded',
                          'transition-colors duration-150',
                          'hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
                        )}
                      >
                        {column.header}
                        {getSortIcon(column.key)}
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                ))}
                {actions && (
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                    Ações
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <TableSkeleton
                  columns={columns.length}
                  rows={skeletonRows}
                  hasActions={!!actions}
                />
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (actions ? 1 : 0)}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr
                    key={item.id}
                    className={cn(
                      'transition-colors duration-150',
                      'hover:bg-muted/50'
                    )}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn('px-4 py-3 text-sm', column.className)}
                      >
                        {column.render
                          ? column.render(item)
                          : String((item as Record<string, unknown>)[column.key] ?? '-')}
                      </td>
                    ))}
                    {actions && (
                      <td className="px-4 py-3 text-right">{actions(item)}</td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              {totalItems > 0 ? (
                <>
                  Mostrando <span className="font-medium">{startItem}</span> a{' '}
                  <span className="font-medium">{endItem}</span> de{' '}
                  <span className="font-medium">{totalItems}</span> registros
                </>
              ) : (
                'Nenhum registro'
              )}
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onPageChange?.(1)}
                  disabled={currentPage === 1}
                  className={cn(
                    'rounded p-1.5',
                    'transition-colors duration-150',
                    'hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed',
                    'focus:outline-none focus:ring-2 focus:ring-primary'
                  )}
                  aria-label="Primeira página"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onPageChange?.(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={cn(
                    'rounded p-1.5',
                    'transition-colors duration-150',
                    'hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed',
                    'focus:outline-none focus:ring-2 focus:ring-primary'
                  )}
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-3 text-sm font-medium">
                  {currentPage} <span className="text-muted-foreground">de</span> {totalPages}
                </span>
                <button
                  onClick={() => onPageChange?.(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={cn(
                    'rounded p-1.5',
                    'transition-colors duration-150',
                    'hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed',
                    'focus:outline-none focus:ring-2 focus:ring-primary'
                  )}
                  aria-label="Próxima página"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onPageChange?.(totalPages)}
                  disabled={currentPage === totalPages}
                  className={cn(
                    'rounded p-1.5',
                    'transition-colors duration-150',
                    'hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed',
                    'focus:outline-none focus:ring-2 focus:ring-primary'
                  )}
                  aria-label="Última página"
                >
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
