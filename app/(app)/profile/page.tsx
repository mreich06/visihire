import { logoutAction } from '@/app/actions/auth';

const Page = () => {
  return (
    <>
      <h1>Profile</h1>
      <form action={logoutAction}>
        <button type="submit" className="rounded bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-50">
          Sign out
        </button>
      </form>
    </>
  );
};

export default Page;
