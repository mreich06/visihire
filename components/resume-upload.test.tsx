import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { uploadResumeMock } = vi.hoisted(() => ({ uploadResumeMock: vi.fn() }));

vi.mock('@/app/actions/profile', () => ({
  uploadResume: uploadResumeMock,
}));

import { ResumeUpload } from './resume-upload';

const makePdf = (name = 'resume.pdf') => new File(['%PDF-1.4 fake pdf content'], name, { type: 'application/pdf' });

describe('ResumeUpload', () => {
  beforeEach(() => {
    uploadResumeMock.mockReset().mockResolvedValue({ error: null });
  });

  it('shows the empty-state prompt when no resume is saved', () => {
    render(<ResumeUpload resumeFileName={null} resumeText={null} />);

    expect(screen.getByText('Click or drag your PDF resume here')).toBeInTheDocument();
    expect(screen.queryByText(/replace your resume/i)).not.toBeInTheDocument();
  });

  it('shows the saved resume summary when one exists', () => {
    render(<ResumeUpload resumeFileName="resume.pdf" resumeText="Some extracted text" />);

    expect(screen.getByText('resume.pdf')).toBeInTheDocument();
    expect(screen.getByText('Some extracted text')).toBeInTheDocument();
    expect(screen.getByText('Click or drag to replace your resume')).toBeInTheDocument();
  });

  it('submits the selected file to uploadResume', async () => {
    const user = userEvent.setup();
    render(<ResumeUpload resumeFileName={null} resumeText={null} />);

    const input = screen.getByLabelText('Upload resume') as HTMLInputElement;
    await user.upload(input, makePdf());

    expect(input.files?.[0]?.name).toBe('resume.pdf');
    expect(uploadResumeMock).toHaveBeenCalledOnce();
  });

  it('shows the error the action returns', async () => {
    uploadResumeMock.mockResolvedValue({ error: 'Only PDF files are supported.' });
    const user = userEvent.setup();
    render(<ResumeUpload resumeFileName={null} resumeText={null} />);

    await user.upload(screen.getByLabelText('Upload resume'), makePdf());

    expect(await screen.findByText('Only PDF files are supported.')).toBeInTheDocument();
  });
});
