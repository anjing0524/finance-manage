import logo from '@/images/logo.png';
import authOptions from '@/lib/auth';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/ui/Button';
import SignInButton from '@/ui/SignInGithubButton';
import SignOutButton from '@/ui/SignOutButton';
import { getServerSession } from 'next-auth';
import Image from 'next/image';
import Link from 'next/link';
import DashBoardNavMenu from './DashBoardNavBar';
import { redirect } from 'next/navigation';

const Navbar = async () => {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect('/login');
  }
  return (
    <div className="fixed left-0 right-0 top-0 z-50 flex h-20 items-center justify-between border-b border-slate-300 bg-white/75 shadow-sm backdrop-blur-sm ">
      <div className="mx-auto flex w-full items-center justify-between">
        <div className="flex flex-row items-center justify-start">
          <Image
            src={logo}
            alt="logo "
            width={60}
            height={60}
            className="mx-4"
          />
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: 'link' }),
              'font-bold text-red-600 hover:bg-slate-300',
            )}
          >
            绘画系统
          </Link>
        </div>
        <div className="hidden gap-4 md:flex">
          {session ? (
            <>
              <DashBoardNavMenu />
              <Image
                src={session.user?.image || ''}
                alt="user-image"
                width={40}
                height={40}
                className="rounded-full"
              />
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
