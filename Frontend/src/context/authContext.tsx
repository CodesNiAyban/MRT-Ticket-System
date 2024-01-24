import { createContext, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "./localstorage";
import { Admin } from "../model/adminModel";
const defaultAdmin: Admin = {
  username: undefined,
}
const AuthContext = createContext({
  admin: defaultAdmin,
  login: (token: string) => { },
  logout: () => { },
});

export const AuthProvider = ({ children }: { children: any }) => {
  const { storedValue: admin, setValue: setAdmin } = useLocalStorage();
  const navigate = useNavigate();

  // call this function when you want to authenticate the admin
  const login = async (token: string) => {
    setAdmin(token);
    navigate("/stations");
  };

  // call this function to sign out logged in admin
  const logout = () => {
    setAdmin(null);
    navigate("/", { replace: true });
  };

  const value = useMemo(
    () => ({
      admin: admin as Admin,
      login,
      logout,
    }),
    [admin]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};