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
          目前支持的功能如下：
        </Paragraph>
      </div>
      <ul>
        <li>1. Paint TODO </li>
        <li>2. User TODO </li>
        <li>2. Data TODO </li>
        <li>2. Releases TODO </li>
      </ul>
    </div>
  );
}
