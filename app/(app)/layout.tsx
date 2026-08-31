import Link from 'next/link';
import type { ReactNode } from 'react';

import { Logo } from '@/components/logo';
import { requireUser } from '@/lib/auth-guard';

const Layout = async ({ children }: { children: ReactNode }) => {
  const user = await requireUser();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-[#fafafa]/80 backdrop-blur-md">
        <nav className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-8">
            <Logo />
            <div className="hidden items-center gap-6 text-sm text-neutral-500 md:flex">
              <Link href="/application-board" className="transition-colors hover:text-neutral-900">
                Applications
              </Link>
              <Link href="/resume-checker" className="transition-colors hover:text-neutral-900">
                Resume Checker
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/profile"
              className="text-neutral-500 transition-colors hover:text-neutral-900"
            >
              {user.email}
            </Link>
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">{children}</main>
    </div>
  );
};

export default Layout;
