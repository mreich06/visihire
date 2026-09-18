import { SignupForm } from '@/components/auth/signup-form';
import { Logo } from '@/components/logo';

const SignupPage = () => {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6">
      <div className="aura-bg" />
      <div className="mb-8">
        <Logo href="/" />
      </div>
      <SignupForm />
    </main>
  );
};

export default SignupPage;
