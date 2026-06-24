export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  STAFF: "staff",
  USER: "user",
};

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: "Super Administrador",
  [ROLES.ADMIN]: "Administrador",
  [ROLES.STAFF]: "Staff",
  [ROLES.USER]: "Usuario",
};

/**
 * Deriva un rol legible/string a partir del objeto usuario del backend.
 * El backend usa `is_staff` / `is_superuser` (campos booleanos de Django).
 */
export const getUserRole = (user) => {
  if (!user) return ROLES.USER;
  if (user.is_superuser) return ROLES.SUPER_ADMIN;
  if (user.is_staff) return ROLES.ADMIN;
  return user.role || ROLES.USER;
};

export const isAdminUser = (user) => {
  if (!user) return false;
  return !!user.is_staff || !!user.is_superuser;
};

export default ROLES;
