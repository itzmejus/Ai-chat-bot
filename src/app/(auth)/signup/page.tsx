import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { googleAuthEnabled } from "@/lib/config";
import { getCurrentUser } from "@/server/auth/session";

export const metadata = { title: "Sign up" };

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return <AuthForm mode="signup" googleEnabled={googleAuthEnabled} />;
}
