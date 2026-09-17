'use client';

import { createJob, type FormState } from '@/app/actions/jobs';
import React, { useActionState } from 'react';

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
    <form action={formAction}>
      <input name="company" type="text" required />
      <input name="title" type="text" required />
      <input name="url" type="text" />
      <textarea name="jdText" />
      <input name="notes" type="text" />
      {state.error && <p>{state.error}</p>}
      <button type="submit" disabled={pending}>
        Add Job
      </button>
    </form>
  );
};

export default AddJobForm;
