"use client";

import { LoginForm } from "@/components/login-form";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/types";

export default function LoginPage() {
  const router = useRouter();

  const handleLoginSuccess = (payload: {
    id: string;
    role: UserRole;
    token: string;
  }) => {
    const { id, role, token } = payload;
    const sessionData = { id, role };
    localStorage.setItem("currentUser", JSON.stringify(sessionData));
    localStorage.setItem("auth_token", token);

    router.push("/");
  };

  return (
    <div>
      <LoginForm onLoginSuccess={handleLoginSuccess} />
    </div>
  );
}
