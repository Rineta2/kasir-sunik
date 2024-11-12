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
  setDoc,
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
  const [savedPrinter, setSavedPrinter] = useState(null);

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

  useEffect(() => {
    const fetchSavedPrinter = async () => {
      const printerDoc = await getDoc(doc(db, "settings", "printer"));
      if (printerDoc.exists()) {
        setSavedPrinter(printerDoc.data());
      }
    };
    fetchSavedPrinter();
  }, []);

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
      let device;

      if (!savedPrinter) {
        // If no saved printer, request new connection
        device = await navigator.bluetooth.requestDevice({
          filters: [{ services: ["000018f0-0000-1000-8000-00805f9b34fb"] }],
        });

        // Save printer info to Firebase
        await setDoc(doc(db, "settings", "printer"), {
          name: device.name,
          id: device.id,
        });
        setSavedPrinter({ name: device.name, id: device.id });
      } else {
        // Use saved printer
        const devices = await navigator.bluetooth.getDevices();
        device = devices.find((d) => d.id === savedPrinter.id);

        if (!device) {
          // If saved printer not found, request new connection
          device = await navigator.bluetooth.requestDevice({
            filters: [{ services: ["000018f0-0000-1000-8000-00805f9b34fb"] }],
          });

          // Update saved printer info
          await setDoc(doc(db, "settings", "printer"), {
            name: device.name,
            id: device.id,
          });
          setSavedPrinter({ name: device.name, id: device.id });
        }
      }

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(
        "000018f0-0000-1000-8000-00805f9b34fb"
      );
      const characteristic = await service.getCharacteristic(
        "00002af1-0000-1000-8000-00805f9b34fb"
      );

      // Modern receipt format with centered text and better spacing
      const receiptParts = [
        [
          "\x1B\x40", // Initialize printer
          "\x1B\x61\x01", // Center alignment
          "\x1B\x21\x10", // Double height text
          "SUNIK YOHAN\n",
          "\x1B\x21\x00", // Normal text
          "\n",
          "Kp dukuh, RT.03/RW.08, Cibadak\n",
          "Kec. Ciampea, Kabupaten Bogor\n",
          "Jawa Barat 16620\n",
          "Telp: 0812-8425-8290\n\n",
          "\x1B\x61\x00", // Left alignment
          "================================\n",
          "\x1B\x61\x01", // Center alignment
          "STRUK PEMBELIAN\n",
          "\x1B\x61\x00", // Left alignment
          `Nomor   : ${trans.transactionCode}\n`,
          `Tanggal : ${trans.date.toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}\n`,
          `Waktu   : ${trans.date.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })}\n`,
          "================================\n",
        ].join(""),
      ];

      // Items section with better formatting
      for (const item of trans.items) {
        const itemName = `${item.namaBarang}${
          item.size ? ` (${item.size})` : ""
        }`;
        const quantity = `${item.quantity}x`;
        const price = `@Rp ${(item.harga || 0).toLocaleString()}`;
        const total = `Rp ${(
          (item.harga || 0) * item.quantity
        ).toLocaleString()}`;

        receiptParts.push(
          `${itemName}\n` + `${quantity.padEnd(6)}${price.padEnd(15)}${total}\n`
        );
      }

      // Footer section with payment details
      receiptParts.push(
        [
          "================================\n",
          `TOTAL${" ".repeat(26)}Rp ${trans.total.toLocaleString()}\n`,
          `TUNAI${" ".repeat(26)}Rp ${trans.paymentAmount.toLocaleString()}\n`,
          `KEMBALI${" ".repeat(24)}Rp ${trans.change.toLocaleString()}\n`,
          "================================\n\n",
          "\x1B\x61\x01", // Center alignment
          "Terima kasih atas kunjungan Anda\n\n",
          "\x1B\x21\x10", // Double height text
          "SELAMAT BERBELANJA KEMBALI\n",
          "\x1B\x21\x00", // Normal text
          "\n",
          "Barang yang sudah dibeli\n",
          "tidak dapat ditukar/dikembalikan\n",
          "\n\n\n", // Paper feed
          "\x1D\x56\x41\x03", // Cut paper
        ].join("")
      );

      const encoder = new TextEncoder();
      for (const part of receiptParts) {
        const data = encoder.encode(part);
        await characteristic.writeValue(data);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      alert("Printing started!");
    } catch (error) {
      console.error("Printing error:", error);
      if (error.name === "NotFoundError") {
        // Clear saved printer if not found
        await deleteDoc(doc(db, "settings", "printer"));
        setSavedPrinter(null);
        alert("Printer tidak ditemukan. Silakan hubungkan printer baru.");
      } else {
        alert("Gagal mencetak. Silakan cek koneksi printer Anda.");
      }
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
