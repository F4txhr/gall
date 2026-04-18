import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage(): JSX.Element {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bucin-bg px-4">
      <LoginForm />
    </main>
  );
}
