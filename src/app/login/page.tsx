"use client";

import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BarChart3 } from "lucide-react";

function AuthRedirect() {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);
  const router = useRouter();

  useEffect(() => {
    if (authStatus === "authenticated") {
      router.push("/dashboard");
    }
  }, [authStatus, router]);

  return null;
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center px-4">
      <div className="mb-8 flex items-center gap-2">
        <BarChart3 className="w-8 h-8 text-[var(--color-primary)]" />
        <span className="text-2xl font-bold text-[var(--color-text)]">
          FinGao
        </span>
      </div>
      <div className="w-full max-w-md">
        <Authenticator
          signUpAttributes={["given_name", "family_name"]}
          formFields={{
            signUp: {
              given_name: {
                label: "First Name",
                placeholder: "Enter your first name",
                order: 1,
              },
              family_name: {
                label: "Last Name",
                placeholder: "Enter your last name",
                order: 2,
              },
              email: {
                order: 3,
              },
              password: {
                order: 4,
              },
              confirm_password: {
                order: 5,
              },
            },
          }}
        >
          <AuthRedirect />
        </Authenticator>
      </div>
    </div>
  );
}
