import { logoutAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';

const Page = () => {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-zinc-900">Profile</h1>
      <form action={logoutAction}>
        <Button type="submit" variant="outline">
          Sign out
        </Button>
      </form>
    </div>
  );
};

export default Page;
