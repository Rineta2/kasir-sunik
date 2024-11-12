"use client";

import React, { useState, useEffect } from "react";

import img from "@/components/assets/login/img.png";

import { useRouter } from "next/navigation";

import { sendPasswordResetEmail } from "firebase/auth";

import { toast, ToastContainer, Flip } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import { auth } from "@/utils/lib/firebase";

import { useAuth } from "@/utils/auth/context/AuthContext";

import { FaEyeSlash, FaRegUser } from "react-icons/fa";

import { IoEyeSharp } from "react-icons/io5";

import Image from "next/image";

import "@/components/styles/login.scss";
export default function page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login, user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        toast.warn("Akun tidak terdaftar. Silakan periksa email Anda.", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          theme: "light",
          transition: Flip,
        });
      } else if (error.code === "auth/wrong-password") {
        toast.warn("Kata sandi salah. Silakan coba lagi.", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          theme: "light",
          transition: Flip,
        });
      } else if (error.code === "auth/invalid-email") {
        toast.warn("Format email tidak valid. Periksa kembali email Anda.", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          theme: "light",
          transition: Flip,
        });
      } else {
        toast.warn("Terjadi kesalahan saat login. Silakan coba lagi.", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          theme: "light",
          transition: Flip,
        });
      }
    } finally {
      setLoading(false);
      setEmail("");
      setPassword("");
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      toast.warn("Masukan email untuk mereset password.", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        theme: "light",
        transition: Flip,
      });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast.warn(
        "Pesan reset ulang kata sandi telah terkirim. Periksa email Anda.",
        {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          theme: "light",
          transition: Flip,
        }
      );
      setTimeout(() => {
        setIsResetPassword(false);
        router.push("/login");
      }, 2000);
    } catch (error) {
      toast.warn(`Password reset error: ${error.message}`, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        theme: "light",
        transition: Flip,
      });
    }
  };

  return (
    <section className="login">
      <div className="login__container container">
        <div className="img">
          <Image src={img} alt="login" quality={100} />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form__box">
            <FaRegUser size={30} />

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
          </div>

          {!isResetPassword && (
            <div className="form__box">
              <div
                onClick={() => setShowPassword(!showPassword)}
                className="eye-button"
              >
                {showPassword ? (
                  <IoEyeSharp size={30} />
                ) : (
                  <FaEyeSlash size={30} />
                )}
              </div>

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
            </div>
          )}

          <div className="btn">
            {!isResetPassword ? (
              <button type="submit" className="login__btn" disabled={loading}>
                {loading ? "Loading..." : "Login"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePasswordReset}
                className="reset__btn"
                disabled={loading}
              >
                Lupa Password
              </button>
            )}
          </div>

          <div className="forgot-password">
            <div
              className="link"
              onClick={() => setIsResetPassword(!isResetPassword)}
            >
              {isResetPassword ? "Kembali Login" : "Lupa Password?"}
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
