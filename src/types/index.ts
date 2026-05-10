export const Role = {
  ADMIN: 'ADMIN',
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  SITE_ENGINEER: 'SITE_ENGINEER',
  SAFETY_OFFICER: 'SAFETY_OFFICER',
  VENDOR: 'VENDOR',
  FINANCE_OFFICER: 'FINANCE_OFFICER'
} as const;

export type Role = typeof Role[keyof typeof Role];

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  PENDING_VERIFICATION: 'PENDING_VERIFICATION'
} as const;

export type UserStatus = typeof UserStatus[keyof typeof UserStatus];

export interface User {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  status: UserStatus;
}

export interface AuthResponse {
  token: string;
  type: string;
  expiresIn: number;
  name: string;
  email: string;
  role: Role;
  phone: string;
  userId: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
