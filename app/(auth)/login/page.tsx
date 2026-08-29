import { LoginForm } from '@/components/auth/login-form';

const LoginPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) => {
  const { registered } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <LoginForm justRegistered={registered === '1'} />
    </main>
  );
};

export default LoginPage;
