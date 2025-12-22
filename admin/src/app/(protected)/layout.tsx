'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { SidebarProvider, useSidebar } from '@/components/layout/sidebar-context';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { mobileOpen, setMobileOpen, isMobile } = useSidebar();

  return (
    <div className="flex h-screen">
      {/* Mobile Backdrop */}
      {isMobile && mobileOpen && (
        <div
          className={cn(
            'fixed inset-0 z-40 bg-black/50',
            'transition-opacity duration-200',
            mobileOpen ? 'opacity-100' : 'opacity-0'
          )}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          isMobile
            ? cn(
                'fixed inset-y-0 left-0 z-50',
                'transform transition-transform duration-200 ease-in-out',
                mobileOpen ? 'translate-x-0' : '-translate-x-full'
              )
            : 'relative'
        )}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background transition-all duration-200">
        {children}
      </main>
    </div>
  );
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
}
