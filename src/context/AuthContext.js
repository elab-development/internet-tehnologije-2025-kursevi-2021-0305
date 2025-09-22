import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Proveri da li postoji korisnik u localStorage pri pokretanju aplikacije
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = (username, role) => {
    const userData = { username, role };
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData)); // Čuvanje korisnika u localStorage
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user"); // Brisanje podataka prilikom odjave
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};