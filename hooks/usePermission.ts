import { useAuth } from "@/context/AuthContext";
import { useCallback, useMemo } from "react";

export const usePermission = () => {
  const { user } = useAuth();

  // 1. Memoize the function itself
  const hasPermission = useCallback(
    (
      requiredPermission: string | string[],
      strategy: "some" | "every" = "some",
    ) => {
      const userPermissions = user?.permissions || [];

      if (Array.isArray(requiredPermission)) {
        if (strategy === "every") {
          return requiredPermission.every((p) => userPermissions.includes(p));
        }
        return requiredPermission.some((p) => userPermissions.includes(p));
      }

      return userPermissions.includes(requiredPermission);
    },
    [user?.permissions],
  );
  return useMemo(() => ({ hasPermission }), [hasPermission]);
};
