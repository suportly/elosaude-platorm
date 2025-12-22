'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2, User } from 'lucide-react';
import { usersApi } from '@/lib/api/endpoints';
import type { Beneficiary } from '@/types/api';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface UserSearchInputProps {
  className?: string;
}

export function UserSearchInput({ className }: UserSearchInputProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounce search query (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Fetch users when debounced query changes
  const { data, isLoading } = useQuery({
    queryKey: ['user-search', debouncedQuery],
    queryFn: () => usersApi.list({ search: debouncedQuery, page_size: 5 }),
    enabled: debouncedQuery.length >= 2,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    },
    []
  );

  const handleSelectUser = useCallback(
    (user: Beneficiary) => {
      setIsOpen(false);
      setQuery('');
      router.push(`/users/${user.id}`);
    },
    [router]
  );

  const results = data?.results ?? [];
  const showResults = isOpen && debouncedQuery.length >= 2;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar usuários..."
          className={cn(
            'h-9 w-64 rounded-lg border bg-background pl-9 pr-4 text-sm outline-none',
            'transition-all duration-150',
            'focus:ring-2 focus:ring-primary focus:border-primary'
          )}
        />
        {isLoading && query.length >= 2 && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div
          className={cn(
            'absolute top-full left-0 z-50 mt-1 w-full min-w-[300px]',
            'rounded-lg border bg-card shadow-lg',
            'overflow-hidden',
            'animate-in fade-in-0 zoom-in-95 duration-150'
          )}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : results.length > 0 ? (
            <ul className="py-1">
              {results.map((user) => (
                <li key={user.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectUser(user)}
                    className={cn(
                      'flex w-full items-center gap-3 px-3 py-2 text-left',
                      'transition-colors duration-150',
                      'hover:bg-muted focus:bg-muted focus:outline-none'
                    )}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{user.full_name}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                        user.status === 'ACTIVE' && 'bg-success/10 text-success',
                        user.status === 'PENDING' && 'bg-warning/10 text-warning',
                        user.status === 'SUSPENDED' && 'bg-destructive/10 text-destructive',
                        user.status === 'CANCELLED' && 'bg-muted text-muted-foreground'
                      )}
                    >
                      {user.status === 'ACTIVE' && 'Ativo'}
                      {user.status === 'PENDING' && 'Pendente'}
                      {user.status === 'SUSPENDED' && 'Suspenso'}
                      {user.status === 'CANCELLED' && 'Cancelado'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Nenhum usuário encontrado
            </div>
          )}
        </div>
      )}
    </div>
  );
}
