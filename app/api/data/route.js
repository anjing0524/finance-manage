import authOptions from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export default async function GET(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return new Response('unauthorized', { status: 405 });
  }
  const databases = await prisma.$executeRaw(
    'SELECT datname FROM pg_database;',
  );
  return new Response('ok', { status: 200 });
}
