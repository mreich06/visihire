import { logoutAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FadeIn } from '@/components/ui/fade-in';
import { ResumeUpload } from '@/components/resume-upload';
import { requireUser } from '@/lib/auth-guard';
import { getProfile } from '@/lib/profile';

const Page = async () => {
  const user = await requireUser();
  const profile = await getProfile(user.id);

  return (
    <div className="relative min-h-[70vh] flex justify-center md:mt-10">
      <div className="aura-bg-bleed" />

      <FadeIn className="flex max-w-2xl flex-col gap-8">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Profile</h1>
          <p className="mt-1 text-sm text-zinc-500">Your resume feeds the ATS score and outreach messages.</p>
        </div>

        <Card className="p-6">
          <h2 className="text-base font-semibold text-zinc-900">Resume</h2>
          <div className="mt-4">
            <ResumeUpload resumeFileName={profile?.resumeFileName ?? null} resumeText={profile?.resumeText ?? null} />
          </div>
        </Card>

        <form action={logoutAction} className="self-end">
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </FadeIn>
    </div>
  );
};

export default Page;
