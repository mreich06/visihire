'use client';

import { FileText, UploadCloud } from 'lucide-react';
import { useActionState, useRef, useState, type DragEvent } from 'react';

import { uploadResume, type FormState } from '@/app/actions/profile';
import { cn } from '@/lib/cn';

interface ResumeUploadProps {
  resumeFileName: string | null;
  resumeText: string | null;
}

const initialState: FormState = { error: null };

export const ResumeUpload = ({ resumeFileName, resumeText }: ResumeUploadProps) => {
  const [state, formAction, pending] = useActionState(uploadResume, initialState);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (!file || !inputRef.current || !formRef.current) return;

    const transfer = new DataTransfer();
    transfer.items.add(file);
    inputRef.current.files = transfer.files;
    formRef.current.requestSubmit();
  };

  return (
    <div className="flex flex-col gap-6">
      {resumeFileName && (
        <div className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
          <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-zinc-900">{resumeFileName}</p>
            {resumeText && (
              <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{resumeText}</p>
            )}
          </div>
        </div>
      )}

      <form ref={formRef} action={formAction}>
        <input
          ref={inputRef}
          type="file"
          name="resume"
          accept="application/pdf"
          className="hidden"
          onChange={() => formRef.current?.requestSubmit()}
        />
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click();
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-10 text-center transition-colors',
            dragging ? 'border-primary-400 bg-primary-50' : 'border-zinc-200 hover:border-zinc-300',
          )}
        >
          <UploadCloud className="h-8 w-8 text-primary-500" />
          <p className="text-sm font-medium text-zinc-900">
            {pending
              ? 'Reading your resume…'
              : resumeFileName
                ? 'Click or drag to replace your resume'
                : 'Click or drag your PDF resume here'}
          </p>
          <p className="text-xs text-zinc-400">PDF files up to 8MB</p>
        </div>
      </form>

      {state.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}
    </div>
  );
};
