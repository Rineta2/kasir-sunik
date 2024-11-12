"use client";

import { Fragment } from "react";

import "@/components/styles/globals.scss";

import AuthContextProvider from "@/utils/auth/context/AuthContext";

import { Roboto } from "next/font/google";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  display: "swap",
});

import Metadata from "@/hooks/Metadata";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Metadata />
      <body className={roboto.className}>
        <Fragment>
          <AuthContextProvider>{children}</AuthContextProvider>
        </Fragment>
      </body>
    </html>
  );
}
