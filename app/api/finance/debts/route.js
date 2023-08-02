import authOptions from '@/lib/auth';
import { calRepaymentMode } from '@/lib/finance';
import prisma from '@/lib/prisma';
import { isBefore, parseISO } from 'date-fns';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response('Unauthorized', { status: 405 });
  }
  const debt = await req.json();
  if (!debt || Object.keys(debt).length === 0) {
    return new Response('Invalid parameters', { status: 400 });
  }
  try {
    const { name, type, amount, rate, borrowDate, installment, repaymentMode } =
      debt;
    const repayments = calRepaymentMode({
      mode: repaymentMode,
      amount,
      installment,
      borrowDate: parseISO(borrowDate),
      rate,
    });
    const now = new Date();
    const ret = await prisma.debt.create({
      data: {
        name,
        type,
        amount,
        rate,
        borrowDate,
        installment,
        repaymentMode,
        repayments: {
          createMany: {
            data: repayments.map(({ date, amount }) => ({
              amount,
              repayDate: date,
              isPaid: isBefore(date, now),
            })),
          },
        },
      },
    });
    return NextResponse.json(ret, { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response('插入数据失败', { status: 500 });
  }
}
