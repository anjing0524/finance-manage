// app/api/finance/[id]/route.js

import authOptions from '@/lib/auth';
import { calRepaymentMode } from '@/lib/finance';
import prisma from '@/lib/prisma';
import { isBefore, parseISO } from 'date-fns';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  // Handle the PUT request logic here

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new Response('unauthorized', { status: 403 });
  }
  if (!params.id) {
    return new Response('id is empty', { status: 400 });
  }
  const { name, type, amount, rate, borrowDate, installment, repaymentMode } =
    await request.json();

  try {
    const debt = await prisma.debt.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!debt) {
      return new Response('debt not found', { status: 404 });
    }

    const updatedDebt = {
      name: name || debt.name,
      type: type || debt.type,
      amount: amount || debt.amount,
      rate: rate || debt.rate,
      borrowDate: borrowDate || debt.borrowDate,
      installment: installment || debt.installment,
      repaymentMode: repaymentMode || debt.repaymentMode,
    };

    const now = new Date();
    const repayments = calRepaymentMode({
      mode: updatedDebt.repaymentMode,
      amount: updatedDebt.amount,
      installment: updatedDebt.installment,
      borrowDate: parseISO(updatedDebt.borrowDate),
      rate: updatedDebt.rate,
    }).map(({ date, amount }) => {
      return {
        amount,
        repayDate: date,
        isPaid: isBefore(date, now),
      };
    });
    const ret = await prisma.debt.update({
      where: {
        id: params.id,
      },
      data: {
        ...updatedDebt,
        repayments: {
          deleteMany: {
            debtId: params.id,
          },
          createMany: {
            data: repayments,
          },
        },
      },
    });

    return NextResponse.json(ret, { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response('update failed', { status: 500 });
  }
}

export async function DELETE(_, { params }) {
  // Handle the DELETE request logic here
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new Response('unauthorized', { status: 403 });
  }
  if (!params.id) {
    return new Response('id is empty', { status: 400 });
  }

  console.log(params);
  try {
    await prisma.debt.delete({
      where: {
        id: params.id,
      },
    });
    return NextResponse.json('deleted success', { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response('delete failed', { status: 500 });
  }
}
