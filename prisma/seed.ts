import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

import { PrismaClient } from '../generated/prisma/client';

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const DEV_EMAIL = 'dev@visihire.test';
const DEV_PASSWORD = 'devpassword123';

const main = async () => {
  const hashedPassword = await bcrypt.hash(DEV_PASSWORD, 12);
  const user = await db.user.upsert({
    where: { email: DEV_EMAIL },
    update: { hashedPassword },
    create: { email: DEV_EMAIL, name: 'Dev User', hashedPassword },
  });
  console.log(`seeded ${user.email} / ${DEV_PASSWORD}`);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
