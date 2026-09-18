'use client';

import { useActionState, useState } from 'react';

import { createJob, deleteJob, updateJob, type FormState } from '@/app/actions/jobs';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input, Textarea } from '@/components/ui/input';
import { Job } from '@/generated/prisma/client';

interface AddJobFormProps {
  job?: Job;
  onSuccess: () => void;
}

const JobForm = ({ job, onSuccess }: AddJobFormProps) => {
  const submitAndClose = async (state: FormState, formData: FormData) => {
    const result = job ? await updateJob(job.id, state, formData) : await createJob(state, formData);
    if (!result.error) onSuccess();
    return result;
  };
  const [state, formAction, pending] = useActionState(submitAndClose, { error: null });
  const jobActionText = job ? 'Update job' : 'Add job';
  const jobUpdateText = job ? 'Updating...' : 'Adding...';
  const [deleteMsg, setDeleteMsg] = useState(false);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-zinc-900">{jobActionText}</h2>

      <Field label="Company">
        <Input name="company" type="text" required defaultValue={job?.company} />
      </Field>

      <Field label="Title">
        <Input name="title" type="text" required defaultValue={job?.title} />
      </Field>

      <Field label="Job URL">
        <Input name="url" type="text" placeholder="https://…" defaultValue={job?.url ?? undefined} />
      </Field>

      <Field label="Job description">
        <Textarea
          name="jdText"
          rows={4}
          placeholder="Paste the job description that feeds the ATS check later."
          defaultValue={job?.jdText ?? undefined}
        />
      </Field>

      <Field label="Notes">
        <Input name="notes" type="text" defaultValue={job?.notes ?? undefined} />
      </Field>

      {state.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}

      <div className="mt-1 flex items-center justify-between gap-3">
        {job &&
          (deleteMsg ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-zinc-600">Delete this job?</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => setDeleteMsg(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={async () => {
                  await deleteJob(job.id);
                  onSuccess();
                }}
              >
                Yes, delete
              </Button>
            </div>
          ) : (
            <Button type="button" variant="danger" size="sm" onClick={() => setDeleteMsg(true)}>
              Delete job
            </Button>
          ))}

        <Button type="submit" disabled={pending} className="ml-auto">
          {pending ? jobUpdateText : jobActionText}
        </Button>
      </div>
    </form>
  );
};

export default JobForm;
