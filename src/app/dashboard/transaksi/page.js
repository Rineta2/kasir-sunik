"use client";
import React, { useState, useEffect } from "react";

import { useRouter } from "next/navigation";

import { db } from "@/utils/lib/firebase";

import {
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { FaEdit, FaTrash, FaPrint } from "react-icons/fa";

import "@/components/styles/Dashboard.scss";

import Link from "next/link";

import DeleteConfirmationModal from "@/hooks/dashboard/transaction/DeleteConfirmationModal";

export default function Transaksi() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const transactionId = urlParams.get("id");

        if (transactionId) {
          router.push(`/dashboard/transaksi/form/${transactionId}`);
          return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const q = query(
          collection(db, "transactions"),
          orderBy("date", "desc"),
          where("date", ">=", today),
          where("date", "<", tomorrow)
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
  }, [router]);

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const transactionDoc = await getDoc(doc(db, "transactions", deleteId));
      const transactionData = transactionDoc.data();

      for (const item of transactionData.items) {
        const productRef = doc(db, "dataBarang", item.productId);
        const productDoc = await getDoc(productRef);

        if (productDoc.exists()) {
          const currentStock = productDoc.data().stok;
          await updateDoc(productRef, { stok: currentStock + item.quantity });
        }
      }

      await deleteDoc(doc(db, "transactions", deleteId));
      setTransactions((prev) =>
        prev.filter((transaction) => transaction.id !== deleteId)
      );
      setShowDeleteModal(false);
      alert("Transaksi berhasil dihapus!");
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert("Terjadi kesalahan saat menghapus transaksi");
    }
  };

  const handlePrint = async (trans) => {
    try {
      const printData = {
        header: [
          "Nama Toko",
          "Alamat Toko",
          "Telp: xxx-xxx-xxx",
          "-".repeat(32),
        ],
        items: trans.items,
        total: trans.total,
        payment: trans.payment,
        change: trans.change,
        footer: ["-".repeat(32), "Terima Kasih", "Selamat Berbelanja Kembali"],
      };

      // Cek apakah running di Electron
      if (window.electronAPI) {
        try {
          const result = await window.electronAPI.printReceipt(printData);
          if (result.success) {
            alert("Struk berhasil dicetak!");
          }
        } catch (error) {
          console.error("Electron printing error:", error);
          alert("Gagal mencetak struk. Pastikan printer sudah terhubung.");
        }
      } else {
        alert("Fitur cetak hanya tersedia di aplikasi desktop");
      }
    } catch (error) {
      console.error("Printing error:", error);
      alert("Terjadi kesalahan saat mencetak struk");
    }
  };

  return (
    <section className="transaksi">
      <div className="transaksi__container container">
        <div
          className="heading"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <h1>Daftar Transaksi</h1>
          <Link href="/dashboard/transaksi/form">Tambahkan Transaksi</Link>
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
                  <th>Pembayaran</th>
                  <th>Kembalian</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((transaction, index) => (
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
                    <td>Rp {transaction.paymentAmount.toLocaleString()}</td>
                    <td>Rp {transaction.change.toLocaleString()}</td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          width: "100%",
                        }}
                      >
                        <Link
                          href={`/dashboard/transaksi/form?id=${transaction.id}`}
                          className="edit"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          className="delete"
                          onClick={() => handleDelete(transaction.id)}
                        >
                          <FaTrash />
                        </button>
                        <button
                          className="print"
                          onClick={() => handlePrint(transaction)}
                        >
                          <FaPrint />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
      />
    </section>
  );
}
