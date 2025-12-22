'use client';

import { Bell, Menu } from 'lucide-react';
import { UserSearchInput } from '@/components/ui/user-search-input';
import { UserDropdownMenu } from '@/components/ui/user-dropdown-menu';
import { useSidebar } from './sidebar-context';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  const { toggleCollapsed, collapsed } = useSidebar();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-card/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={toggleCollapsed}
          className={cn(
            'rounded-lg p-2 lg:hidden',
            'transition-colors duration-150',
            'hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary'
          )}
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          <Menu className="h-5 w-5 text-muted-foreground" />
        </button>

        {/* Page Title */}
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <UserSearchInput className="hidden md:block" />

        {/* Notifications */}
        <button
          type="button"
          className={cn(
            'relative rounded-lg p-2',
            'transition-colors duration-150',
            'hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary'
          )}
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
        </button>

        {/* User Dropdown */}
        <UserDropdownMenu />
      </div>
    </header>
  );
}
