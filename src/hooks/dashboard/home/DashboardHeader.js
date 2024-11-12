import React, { useState } from "react";
import Image from "next/image";
import moment from "moment";
import img from "@/components/assets/login/img.png";
import { Calendar } from "@/hooks/dashboard/home/Calendar";

export function DashboardHeader({ currentTime }) {
  const [calendarDate, setCalendarDate] = useState(new Date());

  return (
    <div className="top">
      <div className="heading">
        <h1>Dashboard</h1>
        <span>Selamat Datang, Admin</span>
      </div>

      <div className="img">
        <Image src={img} alt="img" width={400} height={400} quality={100} />
      </div>

      <div className="datetime-display">
        <div className="time">{currentTime.format("HH:mm:ss")}</div>
        <div className="date">
          <Calendar date={calendarDate} setDate={setCalendarDate} />
        </div>
      </div>
    </div>
  );
}
