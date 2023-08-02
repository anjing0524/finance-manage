import SignInButton from '@/ui/SignInButton';
import { UserLoginForm } from '@/ui/UserLoginForm';

export default function Page() {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-400">
      <div className="flex h-auto w-full max-w-md flex-col items-center space-y-8 rounded-lg bg-slate-300 p-8 shadow-lg">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Sign in to your account
        </h2>
        <UserLoginForm />
        <SignInButton className="w-full" />
      </div>
    </div>
  );
}
