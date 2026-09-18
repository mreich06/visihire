import { Check } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FadeIn } from '@/components/ui/fade-in';
import { Logo } from '@/components/logo';
import WorkflowSection from '@/components/workflow-section';

const FEATURES = [
  {
    title: 'Application Tracker',
    bullets: [
      'Add a job to your board',
      <span key="drag">
        Drag it through <strong>Wishlist → Applied → Offer</strong>
      </span>,
      <strong key="feeds" className="font-semibold text-zinc-900">
        Feeds straight into your ATS score and outreach
      </strong>,
    ],
    buttonText: 'Start tracking',
  },
  {
    title: 'ATS Scoring & Resumé Feedback',
    bullets: [
      'Pick any job from your board',
      <span key="ats">
        Get an <strong className="font-semibold text-zinc-900">ATS score, missing keywords,</strong> and <strong>rewrites</strong>
      </span>,
      'See exactly what to change to match the role',
      'Copy the feedback into your resume',
    ],
    buttonText: 'Get your ATS score',
  },
  {
    title: 'Personalized Outreach',
    bullets: [
      <span key="msg">
        Get a <strong className="font-semibold text-zinc-900">personalized</strong> hiring manager message
      </span>,
      <span key="types">
        <strong className="font-semibold text-zinc-900">Track types</strong>: LinkedIn note, follow-up, cold email
      </span>,
      'Drafted from the role and your background',
    ],
    buttonText: 'Start outreach',
  },
];

const Home = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-10">
          <Logo href="/" />
          <nav className="hidden items-center gap-7 text-sm text-zinc-600 md:flex">
            <Link href="/" className="transition-colors hover:text-zinc-900">
              Product
            </Link>
            <a href="#workflow" className="transition-colors hover:text-zinc-900">
              How it works
            </a>
            <a href="#contact" className="transition-colors hover:text-zinc-900">
              Contact
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Sign up</Button>
          </Link>
        </div>
      </header>

      <main className="relative flex-1">
        <div className="aura-bg" />

        <section className="mx-auto flex max-w-3xl flex-col items-center px-6 pt-20 pb-28 text-center">
          <FadeIn delay={0.08}>
            <h1 className="text-5xl font-semibold tracking-tight text-balance text-zinc-900 sm:text-6xl">
              Other trackers watch you apply, <span className="text-primary-600">this one helps you stand out.</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.16}>
            <p className="mt-6 max-w-xl text-lg text-zinc-500">
              VisiHire scores your resume, rewrites the weak spots, drafts your cover letter, and sends a personalized message to the hiring manager,
              all from copying in a job description.
            </p>
          </FadeIn>

          <FadeIn delay={0.24} className="mt-9 flex items-center gap-3">
            <Link href="/signup">
              <Button size="md">Get started</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="md">
                Log in
              </Button>
            </Link>
          </FadeIn>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-6 pb-28">
          <FadeIn className="mb-12 text-center">
            <p className="text-xs font-semibold tracking-wide text-primary-600 uppercase">Core features</p>
            <h2 className="mt-2 text-3xl font-semibold text-zinc-900">Apply smarter. Build visibility. Reach the right people.</h2>
          </FadeIn>

          <div className="grid gap-6 sm:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <FadeIn key={feature.title} delay={0.1 * i}>
                <Card className="flex h-full flex-col p-6">
                  <h3 className="text-lg font-semibold text-zinc-900">{feature.title}</h3>
                  <ul className="mt-3 flex flex-col gap-2 mb-7">
                    {feature.bullets.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-700 pt-1">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100">
                          <Check className="h-2.5 w-2.5 text-primary-700" strokeWidth={3} />
                        </span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="tertiary" className="mt-auto w-full">
                    {feature.buttonText}
                  </Button>
                </Card>
              </FadeIn>
            ))}
          </div>
        </section>

        <WorkflowSection />
      </main>
    </div>
  );
};

export default Home;
