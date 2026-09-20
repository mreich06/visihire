import { Card } from '@/components/ui/card';

const STEPS = [
  {
    title: 'Upload or pick a resume',
    body: 'Upload a PDF or choose one you already saved. We pull the text straight out of it, no manual copying.',
  },
  {
    title: 'Add a target job (optional)',
    body: 'Paste a job description or pick a job you are already tracking. Skip this for a general ATS check on its own.',
  },
  {
    title: 'Get your score and fixes',
    body: 'See your match score, missing keywords, and a step-by-step list of exactly what to fix before you apply.',
  },
];

const CheckerDescription = () => {
  return (
    <div className="mt-10 flex w-full max-w-5xl flex-col gap-6 text-left">
      <h2 className="text-xl font-semibold text-zinc-900">How it works</h2>

      <div className="grid gap-4 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <Card key={step.title} className="p-5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-300 text-xs font-semibold text-zinc-500">
              {i + 1}
            </span>
            <h3 className="mt-3 text-sm font-semibold text-primary-600">{step.title}</h3>
            <p className="mt-1.5 text-sm text-zinc-500">{step.body}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CheckerDescription;
