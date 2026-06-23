import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getOne, query } from "./db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        // OTP login bypass — password checked server-side before calling signIn
        if (credentials.password === "__otp__") {
          const user = await getOne<any>(
            "SELECT id, name, email, phone, role FROM User WHERE email = ?",
            [credentials.email]
          );
          if (!user) return null;
          return { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role };
        }

        if (!credentials?.password) return null;
        const user = await getOne<any>(
          "SELECT id, name, email, password, phone, role FROM User WHERE email = ?",
          [credentials.email]
        );
        if (!user || !user.password) return null;
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;
        return { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.phone = (user as any).phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).phone = token.phone;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
};
