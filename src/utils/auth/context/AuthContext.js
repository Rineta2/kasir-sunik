"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/utils/lib/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  getIdToken,
} from "firebase/auth";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

const AuthContext = createContext({
  user: null,
  isLoading: false,
  error: null,
  login: async () => {},
  handleLogout: async () => {},
});

export default function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await getIdToken(user);
        setUser(user);
        Cookies.set("authToken", token, { expires: 7 });
      } else {
        setUser(null);
        Cookies.remove("authToken");
      }
      setIsLoading(false);
    });

    return () => {
      unsub();
    };
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const token = await getIdToken(user);
      Cookies.set("authToken", token, { expires: 7 });
      setUser(user);
      toast.success(`Welcome back, ${user.email}`);
    } catch (error) {
      setError(error?.message);
      handleLoginError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      Cookies.remove("authToken");
      setUser(null);
      toast.success("Logged out successfully");
    } catch (error) {
      setError(error?.message);
      toast.error("Error signing out");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginError = (error) => {
    const errorMessages = {
      "auth/user-not-found": "Email tidak ditemukan. Silakan coba lagi.",
      "auth/wrong-password": "Kata sandi salah. Silakan coba lagi.",
      "auth/invalid-email":
        "Format email tidak valid. Periksa kembali email Anda.",
    };
    const message =
      errorMessages[error.code] || `Login error: ${error.message}`;
    toast.error(message);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, error, login, handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthContextProvider");
  }
  return context;
};
