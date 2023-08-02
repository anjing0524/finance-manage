const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

prisma
  .$queryRawUnsafe('SELECT datname FROM pg_database order by datname')
  .then((data) => {
    console.log(data);
    const tables = data
      .map((e) => `${e.datname}`)
      .map((db) =>
        prisma
          .$executeRawUnsafe(
            `SELECT TABLE_NAME  FROM information_schema.tables where table_schema = '${db}'`,
          )
          .then((table) => {
            console.log(db);
            console.log(table);
          }),
      );
    Promise.all(tables).then((d) => console.log(d));
  })
  .catch((error) => {
    console.error(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
