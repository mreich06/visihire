'use client';

import { useActionState, useState } from 'react';

import { createJob, deleteJob, updateJob, type FormState } from '@/app/actions/jobs';
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
      <h2 className="text-lg font-semibold text-gray-900">{jobActionText}</h2>

      <label className="flex flex-col gap-1 text-sm text-gray-700">
        Company
        <input
          name="company"
          type="text"
          required
          className="rounded border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
          defaultValue={job?.company}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-gray-700">
        Title
        <input
          name="title"
          type="text"
          required
          className="rounded border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
          defaultValue={job?.title}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-gray-700">
        Job URL
        <input
          name="url"
          type="text"
          placeholder="https://…"
          className="rounded border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
          defaultValue={job?.url ?? undefined}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-gray-700">
        Job description
        <textarea
          name="jdText"
          rows={4}
          placeholder="Paste the job description that feeds the ATS check later."
          className="resize-none rounded border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
          defaultValue={job?.jdText ?? undefined}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-gray-700">
        Notes
        <input
          name="notes"
          type="text"
          className="rounded border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
          defaultValue={job?.notes ?? undefined}
        />
      </label>

      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}

      <div className="mt-1 flex items-center justify-between gap-3">
        {job &&
          (deleteMsg ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Delete this job?</span>
              <button type="button" onClick={() => setDeleteMsg(false)} className="text-gray-500">
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await deleteJob(job.id);
                  onSuccess();
                }}
                className="font-medium text-red-600"
              >
                Yes, delete
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setDeleteMsg(true)}
              className="rounded border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Delete job
            </button>
          ))}

        <button
          type="submit"
          disabled={pending}
          className="ml-auto rounded bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? jobUpdateText : jobActionText}
        </button>
      </div>
    </form>
  );
};

export default JobForm;
