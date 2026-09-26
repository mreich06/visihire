import { beforeEach, describe, expect, it, vi } from 'vitest';

const { authMock, getOrCreateAuditMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  getOrCreateAuditMock: vi.fn(),
}));

vi.mock('@/auth', () => ({ auth: authMock }));
vi.mock('@/lib/audit', () => ({ getOrCreateAudit: getOrCreateAuditMock }));

import { POST } from './route';

const makeRequest = (body: unknown) =>
  new Request('http://localhost/api/audit', {
    method: 'POST',
    body: JSON.stringify(body),
  });

describe('POST /api/audit', () => {
  beforeEach(() => {
    authMock.mockReset();
    getOrCreateAuditMock.mockReset();
  });

  it('returns 401 without hitting getOrCreateAudit when there is no session', async () => {
    authMock.mockResolvedValue(null);

    const res = await POST(makeRequest({ resumeId: 'resume-1' }));

    expect(res.status).toBe(401);
    expect(getOrCreateAuditMock).not.toHaveBeenCalled();
  });

  it('returns 400 for a body missing resumeId', async () => {
    authMock.mockResolvedValue({ user: { id: 'user-1' } });

    const res = await POST(makeRequest({}));

    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('Invalid request.');
    expect(getOrCreateAuditMock).not.toHaveBeenCalled();
  });

  it('calls getOrCreateAudit with the session user id and parsed body, returning the audit', async () => {
    authMock.mockResolvedValue({ user: { id: 'user-1' } });
    getOrCreateAuditMock.mockResolvedValue({ id: 'audit-1', score: 80 });

    const res = await POST(makeRequest({ resumeId: 'resume-1', jobId: 'job-1' }));

    expect(getOrCreateAuditMock).toHaveBeenCalledWith({ userId: 'user-1', resumeId: 'resume-1', jobId: 'job-1' });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: 'audit-1', score: 80 });
  });

  it('works for a general audit with no jobId', async () => {
    authMock.mockResolvedValue({ user: { id: 'user-1' } });
    getOrCreateAuditMock.mockResolvedValue({ id: 'audit-1' });

    await POST(makeRequest({ resumeId: 'resume-1' }));

    expect(getOrCreateAuditMock).toHaveBeenCalledWith({ userId: 'user-1', resumeId: 'resume-1', jobId: undefined });
  });

  it('surfaces an Error thrown by getOrCreateAudit as a 400 with that message (e.g. ownership check)', async () => {
    authMock.mockResolvedValue({ user: { id: 'user-1' } });
    getOrCreateAuditMock.mockRejectedValue(new Error('Resume not found.'));

    const res = await POST(makeRequest({ resumeId: 'resume-1' }));

    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('Resume not found.');
  });

  it('falls back to a generic message when the thrown value is not an Error', async () => {
    authMock.mockResolvedValue({ user: { id: 'user-1' } });
    getOrCreateAuditMock.mockRejectedValue('something weird');

    const res = await POST(makeRequest({ resumeId: 'resume-1' }));

    expect((await res.json()).error).toBe('Something went wrong scoring that resume.');
  });
});
