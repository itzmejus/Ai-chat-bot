import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { googleAuthEnabled } from "@/lib/config";
import { getCurrentUser } from "@/server/auth/session";

export const metadata = { title: "Log in" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return <AuthForm mode="login" googleEnabled={googleAuthEnabled} />;
}
