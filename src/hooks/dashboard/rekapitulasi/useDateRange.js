import { useState, useEffect } from "react";

export function useDateRange(transactions) {
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return [startOfMonth, endOfMonth];
  });

  const [selectedRangeIncome, setSelectedRangeIncome] = useState(0);

  useEffect(() => {
    const [start, end] = dateRange;
    let rangeTotal = 0;

    if (start && end) {
      const endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);

      rangeTotal = transactions.reduce((total, transaction) => {
        const transactionDate = transaction.date;
        if (transactionDate >= start && transactionDate <= endDate) {
          return total + transaction.total;
        }
        return total;
      }, 0);
    }

    setSelectedRangeIncome(rangeTotal);
  }, [transactions, dateRange]);

  const filteredTransactions = transactions.filter((transaction) => {
    if (!dateRange[0] && !dateRange[1]) return true;

    const transactionDate = transaction.date;
    let [start, end] = dateRange;

    if (end) {
      end = new Date(end);
      end.setHours(23, 59, 59, 999);
    }

    if (start && end) {
      return transactionDate >= start && transactionDate <= end;
    } else if (start) {
      return transactionDate >= start;
    } else if (end) {
      return transactionDate <= end;
    }

    return true;
  });

  return {
    dateRange,
    setDateRange,
    selectedRangeIncome,
    filteredTransactions,
  };
}
