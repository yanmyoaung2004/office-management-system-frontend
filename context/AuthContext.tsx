import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, AuthContextType, AuthState } from "@/types/index";
import { usePathname, useRouter } from "next/navigation";
import { apiPost } from "@/lib/api-client";

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const STORAGE_KEY = "auth_token";
interface ValidationResponse {
  success: boolean;
  isValid: boolean;
  user: {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    permissions: string[];
    role: {
      id: string;
      name: string;
    };
    department: {
      id: string;
      name: string;
    };
    is_active: boolean;
    date_joined: string;
  };
  error?: string;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const currentRoute = usePathname();

  useEffect(() => {
    const validateSession = async () => {
      try {
        const response = await apiPost<ValidationResponse>("/auth/validate");
        if (!response.success || !response.isValid) {
          throw new Error(`Session validation failed: ${response.error}`);
        }

        const userData = response.user;
        const mappedUser: User = {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          permissions: userData.permissions,
          fullName: `${userData.first_name} ${userData.last_name}`,
          role: userData.role.name,
          department: userData.department.name,
          isSuperuser: userData.role.name === "SuperAdmin",
        };

        setAuthState((prevState) => ({
          ...prevState,
          user: mappedUser,
        }));
      } catch (error) {
        console.error("Auth initialization error:", error);
        localStorage.removeItem(STORAGE_KEY);
        setAuthState({ user: null, token: null });
      } finally {
        setIsLoading(false);
      }
    };
    if (currentRoute !== "/login") validateSession();
  }, [currentRoute]);

  const login = (user: User, token: string) => {
    if (!user || !token) {
      router.push("/login");
      return;
    }
    const newSession = { user, token };
    setAuthState(newSession);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
  };

  const logout = () => {
    setAuthState({ user: null, token: null });
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
