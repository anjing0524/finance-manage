import authOptions from '@/lib/auth';
import { buttonVariants } from '@/ui/Button';
import SignInButton from '@/ui/SignInButton';
import SignOutButton from '@/ui/SignOutButton';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import DashBoardNavMenu from './DashBoardNavBar';

const Navbar = async () => {
  const session = await getServerSession(authOptions);
  return (
    <div className="fixed left-0 right-0 top-0 z-50 flex h-20 items-center justify-between border-b border-slate-300 bg-white/75 shadow-sm backdrop-blur-sm ">
      <div className="mx-auto flex w-full items-center justify-between">
        <Link href="/" className={buttonVariants({ variant: 'link' })}>
          绘画系统
        </Link>
        <div className="hidden gap-4 md:flex">
          {session ? (
            <>
              <DashBoardNavMenu />
              <Link
                className={buttonVariants({ variant: 'ghost' })}
                href="/dashboard"
              >
                Dashboard
              </Link>
              <SignOutButton />
            </>
          ) : (
            <SignInButton />
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
