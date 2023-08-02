import authOptions from '@/lib/auth';
import LargeHeading from '@/ui/LargeHeading';
import Paragraph from '@/ui/Paragraph';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session && !session.user) {
    notFound();
  }

  return (
    <div className="container mx-auto mt-4">
      <LargeHeading size="md" className="text-bold">
        软件说明:
      </LargeHeading>
      <div className="mt-2 w-full">
        <Paragraph className="max-w-full text-left ">
          该软件设计用于针对数据关联渲染，可以通过此页面分析数据之前的关系.
          目前支持的功能如下：
        </Paragraph>
      </div>
      <ul>
        <li>1. Paint</li>
        <li>2. User</li>
        <li>2. Data</li>
        <li>2. Releases</li>
      </ul>
    </div>
  );
}
