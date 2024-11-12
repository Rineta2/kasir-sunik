"use client";
import React from "react";

import "@/components/styles/Dashboard.scss";

import { DateRangeSelector } from "@/hooks/dashboard/rekapitulasi/DateRangeSelector";

import { TransactionTable } from "@/hooks/dashboard/rekapitulasi/TransactionTable";

import { TotalIncome } from "@/hooks/dashboard/rekapitulasi/TotalIncome";

import { useTransactions } from "@/hooks/dashboard/rekapitulasi/useTransactions";

import { useDateRange } from "@/hooks/dashboard/rekapitulasi/useDateRange";

export default function Rekapitulasi() {
  const { transactions, isLoading } = useTransactions();
  const { dateRange, setDateRange, filteredTransactions, selectedRangeIncome } =
    useDateRange(transactions);

  return (
    <section className="rekapitulasi">
      <div className="rekapitulasi__container container">
        <div className="heading" style={{ marginBottom: "2rem" }}>
          <h1>Rekapitulasi</h1>
        </div>

        <DateRangeSelector dateRange={dateRange} setDateRange={setDateRange} />

        <TransactionTable
          isLoading={isLoading}
          filteredTransactions={filteredTransactions}
        />

        <TotalIncome
          dateRange={dateRange}
          selectedRangeIncome={selectedRangeIncome}
        />
      </div>
    </section>
  );
}
