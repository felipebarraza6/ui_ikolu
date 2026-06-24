import { useAuth } from "../../../contexts/AuthContext";

export const useAdminAuth = () => {
  const { user, isAdmin, isStaff, isSuperUser } = useAuth();
  return {
    user,
    isAdmin,
    isStaff,
    isSuperUser,
  };
};

export default useAdminAuth;
