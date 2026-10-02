import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { googleAuthEnabled } from "@/lib/config";
import { getCurrentUser } from "@/server/auth/session";
import { findInvite, INVITE_TOKEN_PATTERN } from "@/server/team";

export const metadata = { title: "Sign up" };

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const { invite } = await searchParams;
  const token = typeof invite === "string" && INVITE_TOKEN_PATTERN.test(invite) ? invite : undefined;
  if (await getCurrentUser()) redirect(token ? `/invite/${token}` : "/dashboard");

  // Signing up from an invitation: fill in the invited email address.
  const invitation = token ? await findInvite(token) : null;
  return (
    <AuthForm
      mode="signup"
      googleEnabled={googleAuthEnabled}
      invite={token}
      defaultEmail={invitation?.state === "pending" ? invitation.email : undefined}
    />
  );
}
