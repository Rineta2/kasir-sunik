import React from "react";

import { dataNavbar } from "@/components/ui/data/Navbar";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="nav container">
      <ul className="nav__list">
        {dataNavbar.map((item) => {
          return (
            <li key={item.id} className="nav__item">
              <Link href={item.path} className="nav__link">
                <span>{item.icons}</span>
                <span>{item.tile}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
