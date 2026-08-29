import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';

import { db } from '@/lib/db';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const email = credentials.email;
        const password = credentials.password;
        if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
          return null;
        }

        const user = await db.user.findUnique({ where: { email } });
        if (!user || !user.hashedPassword) {
          return null;
        }
        const ok = await bcrypt.compare(password, user.hashedPassword);
        if (ok) {
          return { id: user.id, email: user.email, name: user.name };
        } else {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
});
