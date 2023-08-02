import authOptions from '@/lib/auth';
import prisma from '@/lib/prisma';
import FinanceTabs from '@/ui/FinanceTabs';
import LargeHeading from '@/ui/LargeHeading';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  const debts = await prisma.debt.findMany();
  const events = await prisma.repayment.findMany({
    select: {
      repayDate: true,
      amount: true,
      id: true,
      debt: {
        select: {
          name: true,
        },
      },
    },
  });

  return (
    <div className="container mx-auto w-full ">
      <div className="flex w-full justify-center">
        <LargeHeading size="md" className="mt-2">
          财务管理
        </LargeHeading>
      </div>
      <div className="w-full pt-2">
        <FinanceTabs debts={debts} events={events} />
      </div>
    </div>
  );
}
