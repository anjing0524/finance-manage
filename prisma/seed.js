const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
// Generate mock data
const mockData = [
  {
    name: '1',
    email: '1@example.com',
    pwd: bcrypt.hashSync('123', bcrypt.genSaltSync()),
  },
];

// Use the mock data with Prisma
async function generateMockData() {
  // Use the mock data to create records in your database
  await prisma.user.createMany({ data: mockData });
}

generateMockData()
  .catch((error) => {
    console.error(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
