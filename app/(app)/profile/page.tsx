import { logoutAction } from '@/app/actions/auth';
import { ResumeUpload } from '@/components/resume-upload';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FadeIn } from '@/components/ui/fade-in';
import { requireUser } from '@/lib/auth-guard';

const Page = async () => {
  await requireUser();

  return (
    <div className="relative min-h-[70vh] flex justify-center md:mt-10">
      <div className="aura-bg-bleed" />

      <FadeIn className="flex w-full max-w-2xl flex-col gap-8">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Profile</h1>
          <p className="mt-1 text-sm text-zinc-500">Your resumes feed the ATS score and outreach messages.</p>
        </div>

        <Card className="p-6">
          <h2 className="text-base font-semibold text-zinc-900">Upload a resume</h2>
          <div className="mt-4">
            <ResumeUpload resumeFileName={null} resumeText={null} withFile={false} />
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
