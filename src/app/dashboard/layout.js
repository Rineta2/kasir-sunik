"use client";

import { useAdmin } from "@/utils/auth/context/admin/read";

import { useAuth } from "@/utils/auth/context/AuthContext";

import { Fragment, useState, useEffect } from "react";

import Error from "@/hooks/dashboard/error/Error";

import Header from "@/components/ui/layout/Header";

import Navbar from "@/components/ui/layout/Navbar";

import "@/components/styles/Dashboard.scss";

export default function Dashboard({ children }) {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { user, isLoading: authIsLoading } = useAuth();
  const {
    error,
    data,
    isLoading: adminIsLoading,
  } = useAdmin({ uid: user?.uid });

  useEffect(() => {
    if (!authIsLoading && !adminIsLoading) {
      setIsInitialLoading(false);
    }
  }, [authIsLoading, adminIsLoading]);

  if (isInitialLoading) {
    return (
      <div
        className="spinner-container"
        style={{
          textAlign: "center",
          padding: "4rem",
        }}
      >
        <div className="spinner-border" role="status"></div>
      </div>
    );
  }

  if (error || !user || !data) {
    return (
      <section className="error">
        <Error />
      </section>
    );
  }

  return (
    <Fragment>
      <main className="dashboard">
        <div className="sidebar">
          <Header />
          <Navbar />
        </div>
        <div className="aside">{children}</div>
      </main>
    </Fragment>
  );
}
