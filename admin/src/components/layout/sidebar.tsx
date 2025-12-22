'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Building2,
  Receipt,
  FileBarChart,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useSidebar } from './sidebar-context';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Usuários',
    href: '/users',
    icon: Users,
  },
  {
    label: 'Prestadores',
    href: '/providers',
    icon: Building2,
  },
  {
    label: 'Reembolsos',
    href: '/reimbursements',
    icon: Receipt,
  },
  {
    label: 'Relatórios',
    href: '/reports',
    icon: FileBarChart,
  },
  {
    label: 'Configurações',
    href: '/settings',
    icon: Settings,
    permission: 'SUPER_ADMIN',
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { collapsed, toggleCollapsed } = useSidebar();

  const filteredNavItems = navItems.filter((item) => {
    if (!item.permission) return true;
    return session?.user?.role === item.permission;
  });

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'flex h-screen flex-col border-r transition-all duration-200',
          'bg-sidebar text-sidebar-foreground',
          collapsed ? 'w-[72px]' : 'w-[240px]'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-center border-b border-sidebar-border px-4">
          {collapsed ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">E</span>
            </div>
          ) : (
            <Image
              src="/logo.png"
              alt="EloSaúde"
              width={160}
              height={40}
              className="h-10 w-auto"
              priority
            />
          )}
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={toggleCollapsed}
          className={cn(
            'mx-auto my-2 flex h-8 w-8 items-center justify-center rounded-lg',
            'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            'transition-colors duration-150'
          )}
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-2 py-2">
          {filteredNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            const linkContent = (
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                  'transition-colors duration-150',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  collapsed && 'justify-center px-2'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.href}>{linkContent}</div>;
          })}
        </nav>

        {/* User info and logout */}
        <div className="border-t border-sidebar-border p-2">
          {!collapsed && (
            <div className="mb-3 px-3">
              <p className="truncate text-sm font-medium text-sidebar-primary-foreground">
                {session?.user?.name}
              </p>
              <p className="truncate text-xs text-sidebar-foreground">
                {session?.user?.email}
              </p>
              <span
                className={cn(
                  'mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium',
                  'bg-sidebar-primary/20 text-sidebar-primary'
                )}
              >
                {session?.user?.role === 'SUPER_ADMIN'
                  ? 'Super Admin'
                  : session?.user?.role === 'ADMIN'
                  ? 'Admin'
                  : 'Visualizador'}
              </span>
            </div>
          )}

          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  className={cn(
                    'flex w-full items-center justify-center rounded-lg p-2.5',
                    'text-sidebar-foreground transition-colors duration-150',
                    'hover:bg-destructive hover:text-destructive-foreground'
                  )}
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                Sair
              </TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={handleLogout}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                'text-sidebar-foreground transition-colors duration-150',
                'hover:bg-destructive hover:text-destructive-foreground'
              )}
            >
              <LogOut className="h-5 w-5" />
              Sair
            </button>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
