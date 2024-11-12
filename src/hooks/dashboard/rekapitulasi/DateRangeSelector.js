import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export function DateRangeSelector({ dateRange, setDateRange }) {
  return (
    <div className="toolbar">
      <DatePicker
        selectsRange={true}
        startDate={dateRange[0]}
        endDate={dateRange[1]}
        onChange={(update) => {
          setDateRange(update);
        }}
        className="form-control"
        placeholderText="Pilih rentang tanggal"
        isClearable={true}
      />
    </div>
  );
}
