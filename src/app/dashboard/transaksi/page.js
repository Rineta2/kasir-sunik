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
  const [bluetoothDevice, setBluetoothDevice] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastConnectedPrinter, setLastConnectedPrinter] = useState(null);

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
      try {
        const printerDoc = await getDoc(doc(db, "settings", "printer"));
        if (printerDoc.exists()) {
          setSavedPrinter(printerDoc.data());
          setLastConnectedPrinter(printerDoc.data());
        }
      } catch (error) {
        console.error("Error fetching saved printer:", error);
      }
    };

    fetchSavedPrinter();
  }, []);

  useEffect(() => {
    if (bluetoothDevice) {
      setIsConnected(bluetoothDevice.gatt.connected);

      bluetoothDevice.addEventListener("gattserverdisconnected", () => {
        setIsConnected(false);
        setBluetoothDevice(null);
      });
    } else {
      setIsConnected(false);
    }
  }, [bluetoothDevice]);

  useEffect(() => {
    const reconnectPrinter = async () => {
      try {
        const savedPrinterData = localStorage.getItem("printerConnection");
        if (savedPrinterData) {
          const printerInfo = JSON.parse(savedPrinterData);

          const device = await navigator.bluetooth.requestDevice({
            filters: [
              {
                services: ["000018f0-0000-1000-8000-00805f9b34fb"],
                name: printerInfo.name,
              },
            ],
            optionalServices: ["000018f0-0000-1000-8000-00805f9b34fb"],
          });

          await device.gatt.connect();
          setBluetoothDevice(device);
          setIsConnected(true);
          setSavedPrinter(printerInfo);
        }
      } catch (error) {
        console.error("Error reconnecting to printer:", error);
        localStorage.removeItem("printerConnection");
      }
    };

    reconnectPrinter();
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
      let device = bluetoothDevice;

      if (!device || !device.gatt.connected) {
        const printerDoc = await getDoc(doc(db, "settings", "printer"));
        if (printerDoc.exists()) {
          device = await navigator.bluetooth.requestDevice({
            filters: [
              {
                services: ["000018f0-0000-1000-8000-00805f9b34fb"],
                name: printerDoc.data().name,
              },
            ],
            optionalServices: ["000018f0-0000-1000-8000-00805f9b34fb"],
          });
        } else {
          device = await navigator.bluetooth.requestDevice({
            filters: [{ services: ["000018f0-0000-1000-8000-00805f9b34fb"] }],
            optionalServices: ["000018f0-0000-1000-8000-00805f9b34fb"],
          });

          await setDoc(doc(db, "settings", "printer"), {
            name: device.name,
            id: device.id,
          });
          setSavedPrinter({ name: device.name, id: device.id });
        }

        await device.gatt.connect();
        setBluetoothDevice(device);
        setIsConnected(true);

        const printerInfo = {
          name: device.name,
          id: device.id,
        };
        localStorage.setItem("printerConnection", JSON.stringify(printerInfo));
      }

      if (!trans) {
        alert("Printer berhasil terhubung!");
        return;
      }

      const service = await device.gatt.getPrimaryService(
        "000018f0-0000-1000-8000-00805f9b34fb"
      );
      const characteristic = await service.getCharacteristic(
        "00002af1-0000-1000-8000-00805f9b34fb"
      );

      const receiptParts = [
        [
          "\x1B\x40", // Initialize printer
          "\x1B\x61\x01", // Center alignment
          "\x1B\x21\x30", // Larger text (double height + double width)
          "SUNIK YOHAN\n",
          "\x1B\x21\x00", // Normal text
          "Minuman & Makanan\n",
          "\n",
          "Kp dukuh, RT.03/RW.08, Cibadak\n",
          "Kec. Ciampea, Kab. Bogor\n",
          "Jawa Barat 16620\n",
          "Telp: 0812-8425-8290\n",
          "\n",
          "================================\n", // Changed to = for better visibility
          "\x1B\x21\x10", // Double width
          "STRUK PEMBELIAN\n",
          "\x1B\x21\x00", // Normal text
          "\x1B\x61\x00", // Left alignment
          `No.: ${trans.transactionCode}\n`,
          `Tgl: ${trans.date.toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}\n`,
          `Jam: ${trans.date.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })}\n`,
          "================================\n",
        ].join(""),
      ];

      // Modified header format with better column separation
      receiptParts.push(
        "Nama Barang     Qty      Harga\n" + // Adjusted spacing
          "================================\n"
      );

      // Modified item formatting without subtotal
      for (const item of trans.items) {
        const itemName = item.namaBarang;
        const quantity = item.quantity.toString();
        const price = `Rp${(item.harga || 0).toLocaleString()}`;

        // Format each item with fixed width columns
        let itemLines = "";

        // Handle long item names by splitting into multiple lines
        if (itemName.length > 15) {
          itemLines += `${itemName.slice(0, 15)}\n`;
          itemLines += `${itemName.slice(15).padEnd(15)}`;
        } else {
          itemLines += itemName.padEnd(15);
        }

        itemLines += `${quantity.padStart(3)}  `;
        itemLines += `${price.padStart(10)}\n`;

        receiptParts.push(itemLines);
      }

      // Modified footer with better alignment
      receiptParts.push(
        [
          "================================\n",
          "\x1B\x45\x01", // Bold on
          `TOTAL      : Rp ${trans.total.toLocaleString().padStart(12)}\n`,
          `TUNAI      : Rp ${trans.paymentAmount
            .toLocaleString()
            .padStart(12)}\n`,
          `KEMBALIAN  : Rp ${trans.change.toLocaleString().padStart(12)}\n`,
          "\x1B\x45\x00", // Bold off
          "================================\n",
          "\x1B\x61\x01", // Center alignment
          "\n",
          "Terima kasih atas kunjungan Anda\n",
          "SELAMAT BERBELANJA KEMBALI\n",
          "\n",
          "* Barang yang sudah dibeli *\n",
          "* tidak dapat ditukar/dikembalikan *\n",
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
      setIsConnected(false);
      setBluetoothDevice(null);
      if (error.name === "NotFoundError" || error.name === "NetworkError") {
        alert("Printer tidak ditemukan. Silakan hubungkan ulang printer.");
      } else {
        alert("Gagal mencetak. Silakan cek koneksi printer Anda.");
      }
      localStorage.removeItem("printerConnection");
    }
  };

  const getButtonText = () => {
    if (isConnected && savedPrinter) {
      return `Printer: ${savedPrinter.name} (Terhubung)`;
    } else if (lastConnectedPrinter) {
      return `Hubungkan ke ${lastConnectedPrinter.name}`;
    }
    return "Hubungkan Printer";
  };

  const handleConnectPrinter = async () => {
    try {
      let device = bluetoothDevice;

      if (!device || !device.gatt.connected) {
        device = await navigator.bluetooth.requestDevice({
          filters: [{ services: ["000018f0-0000-1000-8000-00805f9b34fb"] }],
          optionalServices: ["000018f0-0000-1000-8000-00805f9b34fb"],
        });

        await device.gatt.connect();
        setBluetoothDevice(device);
        setIsConnected(true);
        setSavedPrinter({ name: device.name, id: device.id });
      }
    } catch (error) {
      console.error("Error reconnecting to printer:", error);
      localStorage.removeItem("printerConnection");
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
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              onClick={() => handlePrint()}
              className="btn btn-primary"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <FaPrint /> {getButtonText()}
            </button>
            <Link href="/dashboard/transaksi/form">Tambahkan Transaksi</Link>
          </div>
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
