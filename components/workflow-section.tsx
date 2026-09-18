'use client';

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'motion/react';
import Image from 'next/image';
import { useRef, useState } from 'react';

import { cn } from '@/lib/cn';

const STEPS = [
  {
    title: 'Add to tracking board',
    body: 'Copy a job description and add it to your board. Add optional items like notes and job listing URL.',
    image: '/workflow/1.jpg',
  },
  {
    title: 'Get your ATS score',
    body: 'Select the job and see your ATS match, missing keywords, and rewrites. Know exactly what needs to change before you apply.',
    image: '/workflow/2.jpg',
  },
  {
    title: 'Send outreach',
    body: 'Use the personalized hiring-manager message drafted for that specific role. Track different message types - first touch, follow-up, LinkedIn, all in one place.',
    image: '/workflow/3.jpg',
  },
];

interface StepBarProps {
  scrollYProgress: MotionValue<number>;
  index: number;
}

const StepBar = ({ scrollYProgress, index }: StepBarProps) => {
  const scaleX = useTransform(scrollYProgress, [index / STEPS.length, (index + 1) / STEPS.length], [0, 1], { clamp: true });

  return (
    <div className="mt-4 h-0.5 w-full overflow-hidden rounded-full bg-zinc-200">
      <motion.div className="h-full origin-left rounded-full bg-accent-500" style={{ scaleX }} />
    </div>
  );
};

const WorkflowSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    const index = Math.min(STEPS.length - 1, Math.floor(value * STEPS.length));
    setActive(Math.max(0, index));
  });

  return (
    <section id="workflow" className="mx-auto max-w-6xl px-6 pb-28">
      <div className="mb-12">
        <p className="text-xs font-semibold tracking-wide text-accent-600 uppercase">Workflow</p>
        <h2 className="mt-2 text-3xl font-semibold text-zinc-900">Apply with an actual strategy.</h2>
      </div>

      <div ref={containerRef} className="relative h-[300vh]">
        <div className="sticky top-0 flex h-screen items-start">
          <div className="grid w-full gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col gap-6">
              {STEPS.map((step, i) => (
                <div
                  key={step.title}
                  className={cn('rounded-xl p-5 transition-colors duration-300', i === active ? 'bg-zinc-100' : 'bg-transparent')}
                >
                  <span className="text-xs font-semibold text-accent-600">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="mt-1 text-base font-semibold text-zinc-900">{step.title}</h3>
                  <p className="mt-1.5 text-sm text-zinc-500">{step.body}</p>
                  <StepBar scrollYProgress={scrollYProgress} index={i} />
                </div>
              ))}
            </div>

            <div className="relative hidden h-full overflow-hidden rounded-2xl lg:block">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="absolute inset-0"
                >
                  <Image src={STEPS[active].image} alt={STEPS[active].title} fill sizes="(min-width: 1024px) 480px, 100vw" className="object-cover" />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkflowSection;
