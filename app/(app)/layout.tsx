import Link from 'next/link';
import type { ReactNode } from 'react';

import { AppSidebar } from '@/components/app-sidebar';
import { Logo } from '@/components/logo';
import { requireUser } from '@/lib/auth-guard';

const Layout = async ({ children }: { children: ReactNode }) => {
  const user = await requireUser();

  return (
    <div className="flex min-h-screen flex-col bg-white p-4">
      <header className="flex h-14 shrink-0 items-center justify-between rounded-xl bg-zinc-50 px-4">
        <Logo />

        <Link href="/profile" className="text-sm text-zinc-500 transition-colors hover:text-zinc-900">
          {user.email}
        </Link>
      </header>

      <div className="flex min-h-0 flex-1 gap-4 pt-4">
        <AppSidebar />

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
