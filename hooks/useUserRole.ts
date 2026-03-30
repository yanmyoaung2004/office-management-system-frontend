"use client";

import { UserRole } from "@/types";
import { useState, useEffect } from "react";

interface User {
  id: string;
  role: UserRole;
  username: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/validate`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) throw new Error("Session expired");

        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Auth failed");
        localStorage.removeItem("token"); // Clean up bad tokens
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, []);

  return { user, isLoading, error, isAuthenticated: !!user };
}
