'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface UserDropdownMenuProps {
  className?: string;
}

export function UserDropdownMenu({ className }: UserDropdownMenuProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await signOut({ callbackUrl: '/login' });
  }, []);

  const handleNavigate = useCallback(
    (path: string) => {
      setIsOpen(false);
      router.push(path);
    },
    [router]
  );

  const userName = session?.user?.name || 'Admin';
  const userEmail = session?.user?.email || '';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex items-center gap-2 rounded-lg p-1.5',
          'transition-colors duration-150',
          'hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary'
        )}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
          {userInitial}
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform duration-150',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            'absolute right-0 top-full z-50 mt-1 w-56',
            'rounded-lg border bg-card shadow-lg',
            'overflow-hidden',
            'animate-in fade-in-0 zoom-in-95 duration-150'
          )}
          role="menu"
        >
          {/* User Info */}
          <div className="border-b px-3 py-3">
            <p className="truncate text-sm font-medium">{userName}</p>
            <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
          </div>

          {/* Menu Items */}
          <ul className="py-1">
            <li>
              <button
                type="button"
                onClick={() => handleNavigate('/profile')}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-2 text-left text-sm',
                  'transition-colors duration-150',
                  'hover:bg-muted focus:bg-muted focus:outline-none'
                )}
                role="menuitem"
              >
                <User className="h-4 w-4 text-muted-foreground" />
                Meu Perfil
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => handleNavigate('/settings')}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-2 text-left text-sm',
                  'transition-colors duration-150',
                  'hover:bg-muted focus:bg-muted focus:outline-none'
                )}
                role="menuitem"
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
                Configurações
              </button>
            </li>
          </ul>

          {/* Logout */}
          <div className="border-t py-1">
            <button
              type="button"
              onClick={handleLogout}
              className={cn(
                'flex w-full items-center gap-2 px-3 py-2 text-left text-sm',
                'text-destructive',
                'transition-colors duration-150',
                'hover:bg-destructive/10 focus:bg-destructive/10 focus:outline-none'
              )}
              role="menuitem"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
