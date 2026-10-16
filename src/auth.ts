import bcrypt from "bcryptjs";
import NextAuth, { CredentialsSignin } from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { googleAuthEnabled } from "@/lib/config";
import { loginSchema } from "@/lib/validation";
import { prisma } from "@/server/db/prisma";
import { clientIpFrom } from "@/server/limits/client-ip";
import { rateLimit } from "@/server/limits/rate-limit";

/**
 * Auth.js configuration: email/password plus optional Google login.
 *
 * Sessions are stateless JWTs (required for the credentials provider). The JWT
 * only carries the user id; workspace membership is re-checked against the
 * database on every request (see src/server/auth/session.ts).
 */

/** Thrown when a login is refused for too many attempts; the login form shows its own message for it. */
export class TooManyAttempts extends CredentialsSignin {
  code = "too_many_attempts";
}

const providers: Provider[] = [
  Credentials({
    credentials: { email: {}, password: {} },
    async authorize(raw, request) {
      const parsed = loginSchema.safeParse(raw);
      if (!parsed.success) return null;

      // Slow down password guessing: 8 tries per account and 30 per address every 15 minutes.
      // The limit lives here, not in the login form, so it also covers Auth.js's own
      // sign-in address (/api/auth/callback/credentials), which skips the form.
      const [accountOk, ipOk] = await Promise.all([
        rateLimit(`login:account:${parsed.data.email}`, 8, 900),
        rateLimit(`login:ip:${clientIpFrom(request.headers)}`, 30, 900),
      ]);
      if (!accountOk || !ipOk) throw new TooManyAttempts();

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
      // (TooManyAttempts is a CredentialsSignin too.)
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
        const image = (profile.picture as string | undefined) ?? undefined;
        const existing = await prisma.user.findUnique({ where: { email }, select: { id: true, passwordHash: true, emailVerifiedAt: true } });
        const dbUser = existing
          ? await prisma.user.update({
              where: { id: existing.id },
              // Google has just proved this person owns the address. If the account was made
              // with a password by someone who never confirmed the address, that someone may
              // not be this person: the password is removed and every other session ends, so
              // only the real owner keeps access. They can set a password through "Forgot password".
              data:
                existing.emailVerifiedAt === null
                  ? { image, emailVerifiedAt: new Date(), ...(existing.passwordHash ? { passwordHash: null, sessionVersion: { increment: 1 } } : {}) }
                  : { image },
              select: { id: true, sessionVersion: true },
            })
          : await prisma.user.create({
              data: { email, name: profile.name ?? null, image: image ?? null, emailVerifiedAt: new Date() },
              select: { id: true, sessionVersion: true },
            });
        token.sub = dbUser.id;
        token.sv = dbUser.sessionVersion;
      } else if (user?.id) {
        token.sub = user.id;
        const row = await prisma.user.findUnique({ where: { id: user.id }, select: { sessionVersion: true } });
        token.sv = row?.sessionVersion ?? 0;
      }
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      // The session version this login was issued with; checked against the database on every request.
      session.user.sv = typeof token.sv === "number" ? token.sv : 0;
      return session;
    },
  },
});
