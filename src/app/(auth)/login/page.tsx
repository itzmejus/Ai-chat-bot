import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { googleAuthEnabled } from "@/lib/config";
import { getCurrentUser } from "@/server/auth/session";
import { INVITE_TOKEN_PATTERN } from "@/server/team";

export const metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { invite } = await searchParams;
  const token = typeof invite === "string" && INVITE_TOKEN_PATTERN.test(invite) ? invite : undefined;
  if (await getCurrentUser()) redirect(token ? `/invite/${token}` : "/dashboard");
  return <AuthForm mode="login" googleEnabled={googleAuthEnabled} invite={token} />;
}
