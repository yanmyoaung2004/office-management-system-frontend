export interface User {
  id?: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  department?: string;
  isSuperuser?: boolean;
  password?: string;
  permissions?: string[];
}

export interface UserFormData {
  username: string;
  password: string;
  fullName: string;
  email: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}

export interface AuthContextType extends AuthState {
  login: (user: User, token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

export interface UserListResponse {
  success: boolean;
  data: User[];
}
