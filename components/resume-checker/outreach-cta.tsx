import Link from 'next/link';

import { buttonClasses } from '@/components/ui/button';

const OutreachCta = () => (
  <div className="aura-glow-card mt-4 w-full max-w-5xl overflow-hidden rounded-2xl border border-zinc-200 px-8 py-16 text-center sm:px-16">
    <div className="mx-auto max-w-2xl">
      <h2 className="text-2xl font-semibold text-zinc-900 sm:text-3xl">
        A perfect resume means nothing if the <span className="text-primary-600">right person</span> never sees it.
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-500">
        Reach out directly with email and LinkedIn message templates built for recruiters and hiring managers.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link href="/hiring-outreach" className={buttonClasses('primary')}>
          Explore templates
        </Link>
        <Link href="/hiring-outreach" className={buttonClasses('secondary')}>
          Write your own
        </Link>
      </div>
    </div>
  </div>
);

export default OutreachCta;
