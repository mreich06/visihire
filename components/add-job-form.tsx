'use client';

import { useActionState } from 'react';

import { createJob, type FormState } from '@/app/actions/jobs';

interface AddJobFormProps {
  onSuccess: () => void;
}

const AddJobForm = ({ onSuccess }: AddJobFormProps) => {
  const submitAndClose = async (state: FormState, formData: FormData) => {
    const result = await createJob(state, formData);
    if (!result.error) onSuccess();
    return result;
  };
  const [state, formAction, pending] = useActionState(submitAndClose, { error: null });

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-gray-900">Add job</h2>

      <label className="flex flex-col gap-1 text-sm text-gray-700">
        Company
        <input
          name="company"
          type="text"
          required
          className="rounded border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-gray-700">
        Title
        <input
          name="title"
          type="text"
          required
          className="rounded border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-gray-700">
        Job URL
        <input
          name="url"
          type="text"
          placeholder="https://…"
          className="rounded border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-gray-700">
        Job description
        <textarea
          name="jdText"
          rows={4}
          placeholder="Paste the job description that feeds the ATS check later."
          className="resize-none rounded border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-gray-700">
        Notes
        <input
          name="notes"
          type="text"
          className="rounded border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
        />
      </label>

      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="mt-1 rounded bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-50">
        {pending ? 'Adding…' : 'Add job'}
      </button>
    </form>
  );
};

export default AddJobForm;
