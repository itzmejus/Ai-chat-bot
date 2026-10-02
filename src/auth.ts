import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { googleAuthEnabled } from "@/lib/config";
import { loginSchema } from "@/lib/validation";
import { prisma } from "@/server/db/prisma";

/**
 * Auth.js configuration: email/password plus optional Google login.
 *
 * Sessions are stateless JWTs (required for the credentials provider). The JWT
 * only carries the user id; workspace membership is re-checked against the
 * database on every request (see src/server/auth/session.ts).
 */

const providers: Provider[] = [
  Credentials({
    credentials: { email: {}, password: {} },
    async authorize(raw) {
      const parsed = loginSchema.safeParse(raw);
      if (!parsed.success) return null;

      const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
      // Google-only accounts have no password and cannot log in this way.
      if (!user?.passwordHash) return null;
      if (!(await bcrypt.compare(parsed.data.password, user.passwordHash))) return null;

      return { id: user.id, email: user.email, name: user.name };
    },
  }),
];

if (googleAuthEnabled) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true, // the app runs behind Render's proxy
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers,
  logger: {
    error(error) {
      // A wrong password is an expected outcome, not something to log a stack trace for.
      if ((error as { type?: string }).type === "CredentialsSignin") return;
      console.error("[auth]", error);
    },
  },
  callbacks: {
    signIn({ account, profile }) {
      // Accounts are matched by email, so only accept Google emails Google has verified.
      if (account?.provider === "google") return profile?.email_verified === true;
      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (account?.provider === "google" && profile?.email) {
        // First Google login creates the user; later ones reuse the same row.
        const email = profile.email.toLowerCase();
        const dbUser = await prisma.user.upsert({
          where: { email },
          update: { image: (profile.picture as string | undefined) ?? undefined },
          create: { email, name: profile.name ?? null, image: (profile.picture as string | undefined) ?? null },
        });
        token.sub = dbUser.id;
      } else if (user?.id) {
        token.sub = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
