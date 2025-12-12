import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // Use localStorage
      const storedUser = localStorage.getItem('userInfo');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        const decodedToken = jwtDecode(userData.token);
        if (decodedToken.exp * 1000 < Date.now()) {
          localStorage.removeItem('userInfo');
        } else {
          setUser(userData);
        }
      }
    } catch (error) {
      console.error("Failed to parse user info from storage", error);
      localStorage.removeItem('userInfo');
    } finally {
        setLoading(false);
    }
  }, []);

  const login = (userData) => {
    // Use localStorage
    localStorage.setItem('userInfo', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    // Use localStorage
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};