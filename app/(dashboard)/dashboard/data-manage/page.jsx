import authOptions from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) {
    notFound();
  }
  return (
    <div className="px-auto container w-full pt-2">
      <div className="border- w-full border-indigo-400 px-4">
        <div>Table</div>
      </div>
      数据管理
    </div>
  );
}
