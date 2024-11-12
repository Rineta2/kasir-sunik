import React from "react";

import { useRouter } from "next/navigation";

import { useAuth } from "@/utils/auth/context/AuthContext";

import img from "@/components/assets/login/user/img.png";

import Image from "next/image";

import { CiLogout } from "react-icons/ci";

export default function Header() {
  const { handleLogout, user } = useAuth();

  const router = useRouter();

  const handleLogoutClick = async () => {
    try {
      await handleLogout();
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
  return (
    <header className="header">
      <div className="header__container container">
        <div className="profile">
          <div className="img">
            <Image src={img} alt="profile" width={60} height={60} />
          </div>

          <div className="text">
            {user ? (
              <>
                <h2>{user.displayName || "Admin"}</h2>
                <p>{user.email || "Email not available"}</p>
              </>
            ) : (
              <h2>Welcome!</h2>
            )}
          </div>
        </div>

        {user && (
          <div className="logout__btn" onClick={handleLogoutClick}>
            <CiLogout size={30} />
          </div>
        )}
      </div>
    </header>
  );
}
