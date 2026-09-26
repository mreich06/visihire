'use client';

import { AlertCircle, FileText, UploadCloud } from 'lucide-react';
import { useActionState, useEffect, useRef, useState, type DragEvent } from 'react';

import { uploadResume, type FormState } from '@/app/actions/profile';
import { cn } from '@/lib/cn';
import type { Resume } from '@/generated/prisma/client';

interface ResumeUploadProps {
  resumeFileName: string | null;
  resumeText: string | null;
  withFile?: boolean;
  onUploaded?: (resume: Resume) => void;
}

type PendingFile = { name: string; size: number };

const initialState: FormState = { error: null };

const formatFileSize = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

export const ResumeUpload = ({ resumeFileName, resumeText, withFile = true, onUploaded }: ResumeUploadProps) => {
  const [state, formAction, pending] = useActionState(uploadResume, initialState);
  const [dragging, setDragging] = useState(false);
  const [pendingFile, setPendingFile] = useState<PendingFile | null>(null);
  const [justUploaded, setJustUploaded] = useState<PendingFile | null>(null);
  const [prevPending, setPrevPending] = useState(pending);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // The form resets when the action settles, clearing inputRef.current.files -
  // capture file info at selection time instead (see submitFile). Comparing
  // prevPending during render avoids the extra render pass an effect would add.
  if (pending !== prevPending) {
    setPrevPending(pending);
    if (prevPending && !pending) {
      if (!state.error && pendingFile) setJustUploaded(pendingFile);
      setPendingFile(null);
    }
  }

  // Use useEffect bc calling a parent's setState while
  // this component is rendering isn't safe since parent has already
  // rendered in this pass. state.resume is a fresh object each time a new
  // upload succeeds, so this only fires once per successful upload
  useEffect(() => {
    if (state.resume) onUploaded?.(state.resume);
  }, [state.resume, onUploaded]);

  const submitFile = (file: File) => {
    setJustUploaded(null);
    setPendingFile({ name: file.name, size: file.size });
    formRef.current?.requestSubmit();
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (!file || !inputRef.current) return;

    const transfer = new DataTransfer();
    transfer.items.add(file);
    inputRef.current.files = transfer.files;
    submitFile(file);
  };

  const status = pending ? 'pending' : state.error ? 'error' : justUploaded ? 'success' : 'idle';

  return (
    <div className="flex flex-col gap-6">
      {withFile && resumeFileName && (
        <div className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
          <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-zinc-900">{resumeFileName}</p>
            {resumeText && <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{resumeText}</p>}
          </div>
        </div>
      )}

      <form ref={formRef} action={formAction}>
        <input
          ref={inputRef}
          type="file"
          name="resume"
          accept="application/pdf"
          aria-label="Upload resume"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) submitFile(file);
          }}
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
            status === 'success' && 'border-success/40 bg-success-soft',
            status === 'error' && 'border-danger/40 bg-danger-soft',
            status === 'idle' && (dragging ? 'border-primary-400 bg-primary-50' : 'border-zinc-200 hover:border-zinc-300'),
            status === 'pending' && 'border-zinc-200',
          )}
        >
          {status === 'error' ? (
            <AlertCircle className="h-8 w-8 text-danger" />
          ) : (
            <UploadCloud className={cn('h-8 w-8', status === 'success' ? 'text-success' : 'text-primary-500')} />
          )}

          {status === 'success' && justUploaded ? (
            <>
              <p className="text-sm font-semibold text-zinc-900">{justUploaded.name}</p>
              <p className="text-xs text-zinc-500">{formatFileSize(justUploaded.size)} PDF, Uploaded successfully</p>
            </>
          ) : status === 'error' ? (
            <>
              <p className="text-sm font-semibold text-zinc-900">{state.error}</p>
              <p className="text-xs text-zinc-500">Try uploading again</p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-zinc-900">
                {pending ? 'Reading your resume…' : resumeFileName ? 'Click or drag to replace your resume' : 'Click or drag your PDF resume here'}
              </p>
              <p className="text-xs text-zinc-400">PDF files up to 8MB</p>
            </>
          )}
        </div>
      </form>
    </div>
  );
};
