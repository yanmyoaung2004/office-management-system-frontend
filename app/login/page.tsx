"use client";

import { LoginForm } from "@/components/login-form";
import { useRouter } from "next/navigation";
import type { User } from "@/types";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const handleLoginSuccess = (payload: { user: User; token: string }) => {
    const { user, token } = payload;
    login(user, token);

    // Redirect based on department
    if (user.department === "ADMISSIONS") {
      router.push("/admission/dashboard");
    } else if (user.department === "ENGINEERING") {
      router.push("/exam");
    } else if (user.department === "HR") {
      router.push("/hr");
    } else if (user.department === "FINANCE") {
      router.push("finance/intakes");
    } else if (user.department === "EXAM") {
      router.push("/exam");
    } else if (user.department === "OPERATION") {
      router.push("/operation");
    } else {
      router.push("/admission");
    }
  };

  return (
    <div>
      <LoginForm onLoginSuccess={handleLoginSuccess} />
    </div>
  );
}
