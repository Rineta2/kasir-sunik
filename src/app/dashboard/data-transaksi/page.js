"use client";
import React, { useState, useEffect } from "react";

import { db } from "@/utils/lib/firebase";

import { collection, getDocs, query, orderBy } from "firebase/firestore";

import "@/components/styles/Dashboard.scss";

export default function DataTransaksi() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const q = query(
          collection(db, "transactions"),
          orderBy("date", "desc")
        );
        const querySnapshot = await getDocs(q);
        const transactionsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate(),
        }));
        setTransactions(transactionsData);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  useEffect(() => {
    let filtered = [...transactions];

    if (searchQuery) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.transactionCode
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          transaction.items.some((item) =>
            item.namaBarang.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    if (selectedDate) {
      const start = new Date(selectedDate);
      start.setHours(0, 0, 0);
      const end = new Date(selectedDate);
      end.setHours(23, 59, 59);

      filtered = filtered.filter((transaction) => {
        const transactionDate = transaction.date;
        return transactionDate >= start && transactionDate <= end;
      });
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchQuery, selectedDate]);

  return (
    <section className="history">
      <div className="transaksi__container container">
        <h1 className="mb-4">History Transaksi</h1>

        <div className="toolbar">
          <input
            type="text"
            className="form-control"
            placeholder="Cari transaksi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <input
            type="date"
            className="form-control"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div style={{ textAlign: "center", padding: "4rem" }}>
            <div className="spinner-border" role="status"></div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Kode Transaksi</th>
                  <th>Tanggal</th>
                  <th>Items</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction, index) => (
                  <tr key={transaction.id}>
                    <td>{index + 1}</td>
                    <td>{transaction.transactionCode}</td>
                    <td>
                      {transaction.date?.toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td>
                      <ul className="list-unstyled">
                        {transaction.items.map((item, idx) => (
                          <li key={idx}>
                            {item.namaBarang} {item.size && `(${item.size})`} (
                            {item.quantity}x @Rp{" "}
                            {(item.harga || 0).toLocaleString()})
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td>Rp {transaction.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
