import React from "react";

export function TransactionTable({ isLoading, filteredTransactions }) {
  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <div className="spinner-border" role="status"></div>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            <th>No</th>
            <th>Kode Transaksi</th>
            <th>Tanggal</th>
            <th>Items</th>
            <th>Total</th>
            <th>Pembayaran</th>
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
                      {item.quantity}x @Rp {(item.harga || 0).toLocaleString()})
                    </li>
                  ))}
                </ul>
              </td>
              <td>Rp {transaction.total.toLocaleString()}</td>
              <td>Rp {transaction.paymentAmount.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
