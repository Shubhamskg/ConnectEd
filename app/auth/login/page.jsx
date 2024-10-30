// app/auth/login/page.jsx
"use client"
import Link from "next/link";
import { LoginForm } from "@/app/components/auth/LoginForm";
import { Button } from "@/app/components/ui/button";
import { Icons } from "@/app/components/icons";

// export const metadata = {
//   title: "Login | ConnectEd",
//   description: "Login to your ConnectEd account",
// };

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Choose your preferred sign in method
        </p>
      </div>

      <div className="grid gap-4">
        <Button variant="outline" type="button" disabled={false}>
          <Icons.google className="mr-2 h-4 w-4" />
          Continue with Google
        </Button>
        <Button variant="outline" type="button" disabled={false}>
          <Icons.github className="mr-2 h-4 w-4" />
          Continue with GitHub
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <LoginForm />

      <p className="px-8 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link
          href="/auth/register"
          className="hover:text-brand underline underline-offset-4"
        >
          Sign up
        </Link>{" "}
        for free.
      </p>
    </div>
  );
}