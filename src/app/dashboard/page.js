"use client";
import React, { useState, useEffect } from "react";
import moment from "moment";
import "moment/locale/id";
import { DashboardHeader } from "@/hooks/dashboard/home/DashboardHeader";
import { StatsCards } from "@/hooks/dashboard/home/StatsCards";
import { DashboardCharts } from "@/hooks/dashboard/home/DashboardCharts";
import { useStats } from "@/hooks/dashboard/home/useStats";
import "@/components/styles/Dashboard.scss";

export default function Page() {
  const { stats } = useStats();
  const [currentTime, setCurrentTime] = useState(moment());

  moment.locale("id");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(moment());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="home">
      <div className="home__container container">
        <DashboardHeader currentTime={currentTime} />
        <StatsCards stats={stats} />
      </div>
      <DashboardCharts stats={stats} />
    </section>
  );
}
