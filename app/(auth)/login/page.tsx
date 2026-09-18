import { LoginForm } from '@/components/auth/login-form';
import { Logo } from '@/components/logo';

const LoginPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) => {
  const { registered } = await searchParams;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6">
      <div className="aura-bg" />
      <div className="mb-8">
        <Logo href="/" />
      </div>
      <LoginForm justRegistered={registered === '1'} />
    </main>
  );
};

export default LoginPage;
