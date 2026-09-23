import { NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/auth';
import { getOrCreateAudit } from '@/lib/audit';

// LLM calls can take a while
export const maxDuration = 60;

const bodySchema = z.object({
  resumeId: z.string(),
  jobId: z.string().nullable().optional(),
});

export async function POST(request: Request) {
  // requireUser() redirects on failure, which is meant for pages/actions -
  // a redirect response would just break this route's client-side fetch()
  // callers, so check the session directly and return a real 401 instead.
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'You need to be logged in.' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    console.log('audit request failed validation', { body, issues: parsed.error.issues });
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  try {
    const audit = await getOrCreateAudit({
      userId: session.user.id,
      resumeId: parsed.data.resumeId,
      jobId: parsed.data.jobId,
    });
    return NextResponse.json(audit);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong scoring that resume.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
