import React from "react";

export function TotalIncome({ dateRange, selectedRangeIncome }) {
  if (!dateRange[0] || !dateRange[1]) return null;

  return (
    <div className="income" style={{ marginTop: "1rem" }}>
      <h4 style={{ marginTop: "0.5rem" }}>
        Total Pendapatan {dateRange[0].toLocaleDateString("id-ID")} -{" "}
        {dateRange[1].toLocaleDateString("id-ID")}: Rp{" "}
        {selectedRangeIncome.toLocaleString()}
      </h4>
    </div>
  );
}
