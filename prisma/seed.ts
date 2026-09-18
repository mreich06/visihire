import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

import { PrismaClient } from '../generated/prisma/client';
import type { JobStatus } from '../generated/prisma/enums';

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const DEV_EMAIL = 'dev@visihire.test';
const DEV_PASSWORD = 'devpassword123';
const SAMPLE_JOBS = [
  {
    company: 'Linear',
    title: 'Product Engineer',
    url: 'https://linear.app/careers',
    status: 'WISHLIST',
    notes: 'Referral from Sam. Reach out before applying.',
    jdText:
      'Product Engineers at Linear own features end to end — from design discussions through implementation and rollout. You should be comfortable with TypeScript, React, and thinking deeply about product. We value craft, speed, and a strong sense of ownership.',
  },
  {
    company: 'Vercel',
    title: 'Senior Frontend Engineer',
    url: 'https://vercel.com/careers',
    status: 'WISHLIST',
    notes: '',
    jdText:
      'We are looking for a Senior Frontend Engineer to work on the Vercel dashboard. Deep experience with Next.js, React Server Components, and building accessible, performant UI at scale. You will collaborate closely with design and shape the frontend architecture.',
  },
  {
    company: 'Stripe',
    title: 'Full Stack Engineer, Billing',
    url: 'https://stripe.com/jobs',
    status: 'APPLIED',
    appliedAt: new Date('2026-08-20'),
    notes: 'Applied via referral portal.',
    jdText:
      'The Billing team builds the systems that let millions of businesses bill their customers. You will work across the stack — Ruby and TypeScript — on high-scale, correctness-critical systems. Strong fundamentals in data modeling and API design required.',
  },
  {
    company: 'Notion',
    title: 'Software Engineer, Growth',
    url: 'https://notion.so/careers',
    status: 'INTERVIEWING',
    appliedAt: new Date('2026-08-10'),
    notes: 'Recruiter screen done. Technical phone screen Thu 2pm.',
    jdText:
      'Growth Engineers at Notion run experiments across the signup and activation funnel. You will work with React, TypeScript, and our experimentation platform, partnering with data science and design to move core metrics.',
  },
  {
    company: 'Ramp',
    title: 'Frontend Engineer',
    url: 'https://ramp.com/careers',
    status: 'OFFER',
    appliedAt: new Date('2026-07-28'),
    notes: 'Verbal offer. Comp discussion scheduled. Competing with Notion process.',
    jdText:
      'Frontend Engineers at Ramp build the interfaces finance teams use every day. Expert-level React and TypeScript, an eye for detail, and the ability to ship quickly in a fast-moving environment.',
  },
  {
    company: 'Airbnb',
    title: 'Senior Software Engineer, Payments',
    url: 'https://careers.airbnb.com',
    status: 'REJECTED',
    appliedAt: new Date('2026-07-15'),
    notes: 'Rejected after onsite. Feedback: system design round.',
    jdText:
      'Join the Payments Platform team building the infrastructure that moves billions of dollars for hosts and guests. You will design distributed systems, work in Java and Kotlin, and partner with risk and compliance teams.',
  },
];

const main = async () => {
  const hashedPassword = await bcrypt.hash(DEV_PASSWORD, 12);
  const user = await db.user.upsert({
    where: { email: DEV_EMAIL },
    update: { hashedPassword },
    create: { email: DEV_EMAIL, name: 'Dev User', hashedPassword },
  });
  console.log(`seeded ${user.email} / ${DEV_PASSWORD}`);

  // Job has no unique key so every create makes a new row with a random id
  // Running seed 3x without deleting would mean 18 jobs
  // Delete first to make sure every seed always produces 6
  await db.job.deleteMany({ where: { userId: user.id } });

  await db.job.createMany({
    data: SAMPLE_JOBS.map((job, i) => ({
      ...job,
      status: job.status as JobStatus,
      userId: user.id,
      position: i,
    })),
  });
  console.log(`seeded ${SAMPLE_JOBS.length} jobs`);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
