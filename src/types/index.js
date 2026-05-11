export const Role = {
  ADMIN: 'ADMIN',
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  SITE_ENGINEER: 'SITE_ENGINEER',
  SAFETY_OFFICER: 'SAFETY_OFFICER',
  VENDOR: 'VENDOR',
  FINANCE_OFFICER: 'FINANCE_OFFICER'
};

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  PENDING_VERIFICATION: 'PENDING_VERIFICATION'
};

export const RoleValues = Object.values(Role);
export const UserStatusValues = Object.values(UserStatus);

export const createUser = (userId, name, email, phone, role, status) => ({
  userId,
  name,
  email,
  phone,
  role,
  status
});

export const createAuthResponse = (token, type, expiresIn, name, email, role, phone, userId) => ({
  token,
  type,
  expiresIn,
  name,
  email,
  role,
  phone,
  userId
});

export const createAuthState = (token, user, isAuthenticated, isLoading) => ({
  token,
  user,
  isAuthenticated,
  isLoading
});
