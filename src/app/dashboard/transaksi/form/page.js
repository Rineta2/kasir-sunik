"use client";
import React, { useState, useEffect } from "react";

import { useRouter } from "next/navigation";

import { db } from "@/utils/lib/firebase";

import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import Link from "next/link";

import "@/components/styles/Dashboard.scss";

import TransactionModal from "@/hooks/dashboard/transaction/TransactionModal";

import { ToastContainer, toast, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function TransaksiForm() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [transactionId, setTransactionId] = useState(null);
  const [selectedType, setSelectedType] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);

  const formatNumber = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "dataBarang"));
        const productsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    const checkForEdit = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get("id");

      if (id) {
        setTransactionId(id);
        setIsEditing(true);
        try {
          const transDoc = await getDoc(doc(db, "transactions", id));
          if (transDoc.exists()) {
            const data = transDoc.data();
            setSelectedItems(data.items);
            setPaymentAmount(data.paymentAmount);
          }
        } catch (error) {
          console.error("Error fetching transaction:", error);
        }
      }
    };

    fetchProducts();
    checkForEdit();
  }, []);

  useEffect(() => {
    let filtered = products;

    if (selectedType) {
      filtered = filtered.filter((product) => product.type === selectedType);
    }

    if (searchQuery) {
      filtered = filtered.filter((product) =>
        product.namaBarang.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [selectedType, products, searchQuery]);

  const removeItem = (index) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const updatedItems = [...selectedItems];
    if (field === "productId") {
      const product = products.find((p) => p.id === value);
      if (product) {
        updatedItems[index] = {
          ...updatedItems[index],
          productId: product.id,
          namaBarang: product.namaBarang,
          harga: product.harga,
          stok: product.stok,
          size: product.size || "",
        };
      }
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value,
      };
    }
    setSelectedItems(updatedItems);
  };

  const calculateTotal = () => {
    return selectedItems.reduce(
      (sum, item) => sum + item.harga * item.quantity,
      0
    );
  };

  const calculateChange = () => {
    return paymentAmount - calculateTotal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Add payment validation
    if (paymentAmount < calculateTotal()) {
      toast.error(
        "Pembayaran kurang dari total. Harap masukkan jumlah pembayaran yang benar.",
        {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Zoom,
        }
      );
      return;
    }

    setIsLoading(true);

    try {
      const transactionData = {
        items: selectedItems,
        total: calculateTotal(),
        paymentAmount: parseFloat(paymentAmount),
        change: calculateChange(),
        date: serverTimestamp(),
        ...(isEditing ? {} : { transactionCode: `TRX${Date.now()}` }),
      };

      if (isEditing) {
        const originalTransDoc = await getDoc(
          doc(db, "transactions", transactionId)
        );
        if (!originalTransDoc.exists()) {
          throw new Error("Transaksi original tidak ditemukan");
        }
        const originalItems = originalTransDoc.data().items;

        for (const newItem of selectedItems) {
          const originalItem = originalItems.find(
            (item) => item.productId === newItem.productId
          );
          const productRef = doc(db, "dataBarang", newItem.productId);
          const productDoc = await getDoc(productRef);

          if (productDoc.exists()) {
            const currentStock = productDoc.data().stok;

            if (originalItem) {
              const stockDifference = originalItem.quantity - newItem.quantity;
              if (stockDifference !== 0) {
                const newStock = currentStock + stockDifference;
                if (newStock >= 0) {
                  await updateDoc(productRef, {
                    stok: newStock,
                  });
                } else {
                  throw new Error(
                    `Stok tidak mencukupi untuk ${newItem.namaBarang}`
                  );
                }
              }
            } else {
              const newStock = currentStock - newItem.quantity;
              if (newStock >= 0) {
                await updateDoc(productRef, {
                  stok: newStock,
                });
              } else {
                throw new Error(
                  `Stok tidak mencukupi untuk ${newItem.namaBarang}`
                );
              }
            }
          }
        }

        for (const originalItem of originalItems) {
          const itemStillExists = selectedItems.find(
            (item) => item.productId === originalItem.productId
          );
          if (!itemStillExists) {
            const productRef = doc(db, "dataBarang", originalItem.productId);
            const productDoc = await getDoc(productRef);

            if (productDoc.exists()) {
              const currentStock = productDoc.data().stok;
              await updateDoc(productRef, {
                stok: currentStock + originalItem.quantity,
              });
            }
          }
        }

        await updateDoc(
          doc(db, "transactions", transactionId),
          transactionData
        );
      } else {
        for (const item of selectedItems) {
          const productRef = doc(db, "dataBarang", item.productId);
          const productDoc = await getDoc(productRef);

          if (productDoc.exists()) {
            const currentStock = productDoc.data().stok;
            await updateDoc(productRef, {
              stok: currentStock - item.quantity,
            });
          }
        }

        await addDoc(collection(db, "transactions"), transactionData);
      }

      setShowModal(true);
      setIsLoading(false);
    } catch (error) {
      console.error("Error saving transaction:", error);
      toast.error("Terjadi kesalahan saat menyimpan transaksi", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Zoom,
      });
      setIsLoading(false);
    }
  };

  const handlePaymentChange = (e) => {
    const value = e.target.value.replace(/,/g, "");
    if (/^\d*\.?\d*$/.test(value) || value === "") {
      setPaymentAmount(value === "" ? 0 : parseFloat(value));
    }
  };

  return (
    <section className="transaksi__form">
      <div className="container">
        <div className="heading">
          <h1>{isEditing ? "Edit Transaksi" : "Transaksi Baru"}</h1>

          <Link href="/dashboard/transaksi">Kembali</Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="type">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">Semua Tipe</option>
              <option value="makanan">Makanan</option>
              <option value="minuman">Minuman</option>
            </select>

            <input
              type="text"
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="product__list">
            {filteredProducts.map((product) => (
              <div key={product.id} className="product-card">
                <h3>{product.namaBarang}</h3>
                <p>Ukuran: {product.size || "N/A"}</p>
                <p>Stok: {product.stok}</p>
                <p>Harga: Rp {formatNumber(product.harga)}</p>
                <button
                  type="button"
                  onClick={() => {
                    const existingItemIndex = selectedItems.findIndex(
                      (item) => item.productId === product.id
                    );

                    if (existingItemIndex !== -1) {
                      const updatedItems = [...selectedItems];
                      if (
                        updatedItems[existingItemIndex].quantity < product.stok
                      ) {
                        updatedItems[existingItemIndex].quantity += 1;
                        setSelectedItems(updatedItems);
                      }
                    } else {
                      setSelectedItems([
                        ...selectedItems,
                        {
                          productId: product.id,
                          namaBarang: product.namaBarang,
                          harga: product.harga,
                          quantity: 1,
                          size: product.size || "",
                          stok: product.stok,
                        },
                      ]);
                    }
                  }}
                >
                  Pilih Produk
                </button>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <p>Tidak ada produk yang ditemukan</p>
            )}
          </div>

          <div className="aside__transaksi">
            <div className="item__content">
              {selectedItems.map((item, index) => (
                <div key={index} className="item__row">
                  {item.productId && (
                    <div className="text">
                      <h2>{item.namaBarang}</h2>
                      <span>Ukuran: {item.size}</span>
                      <span>Harga: Rp {formatNumber(item.harga)}</span>
                    </div>
                  )}

                  <div className="box">
                    <label htmlFor="quantity">Jumlah</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, "quantity", parseInt(e.target.value))
                      }
                      min="1"
                      max={item.stok}
                      required
                    />
                  </div>

                  <button type="button" onClick={() => removeItem(index)}>
                    Hapus
                  </button>
                </div>
              ))}
            </div>

            <div className="payment-details">
              <div className="total">
                <strong>Total:</strong> Rp {formatNumber(calculateTotal())}
              </div>

              <div className="payment">
                <label>Pembayaran:</label>
                <input
                  type="text"
                  placeholder="Masukkan jumlah pembayaran"
                  inputMode="numeric"
                  value={paymentAmount ? formatNumber(paymentAmount) : ""}
                  onChange={handlePaymentChange}
                  min={calculateTotal()}
                  required
                />
              </div>

              <div className="kembalian">
                <strong>Kembalian:</strong> Rp {formatNumber(calculateChange())}
              </div>

              <div className="form-actions">
                <button type="submit" disabled={isLoading}>
                  {isLoading ? "Menyimpan..." : "Simpan"}
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/dashboard/transaksi")}
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <TransactionModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          router.push("/dashboard/transaksi");
        }}
        total={calculateTotal()}
        payment={paymentAmount}
        change={calculateChange()}
      />

      <ToastContainer
        position="top-center"
        autoClose={5000}
        limit={1}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover={false}
        theme="light"
        transition={Zoom}
      />
    </section>
  );
}
