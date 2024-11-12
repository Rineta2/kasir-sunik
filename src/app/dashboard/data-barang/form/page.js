"use client";
import React, { useState, useEffect } from "react";

import { db } from "@/utils/lib/firebase";

import { collection, addDoc, updateDoc, doc } from "firebase/firestore";

import { useRouter, useSearchParams } from "next/navigation";

import { getDoc } from "firebase/firestore";

import Link from "next/link";

import "@/components/styles/Dashboard.scss";

export default function Form() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [formData, setFormData] = useState({
    kodeBarang: "",
    namaBarang: "",
    harga: "",
    stok: "",
    size: "",
    type: "makanan",
  });

  const [isLoading, setIsLoading] = useState(false);

  const generateKodeBarang = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `${timestamp}${random}`;
  };

  useEffect(() => {
    const fetchDataForEdit = async () => {
      if (id) {
        try {
          const docRef = doc(db, "dataBarang", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setFormData({
              ...docSnap.data(),
              kodeBarang: docSnap.data().kodeBarang || generateKodeBarang(),
            });
          }
        } catch (error) {
          console.error("Error fetching document:", error);
        }
      } else {
        setFormData((prev) => ({
          ...prev,
          kodeBarang: generateKodeBarang(),
        }));
      }
    };

    fetchDataForEdit();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "type" && {
        size: value === "makanan" ? "" : "small",
      }),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (id) {
        const barangRef = doc(db, "dataBarang", id);
        await updateDoc(barangRef, formData);
      } else {
        await addDoc(collection(db, "dataBarang"), formData);
      }
      router.push("/dashboard/data-barang");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="form__barang">
      <div className="barang__container container">
        <div
          className="heading"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "2rem",
          }}
        >
          <Link href="/dashboard/data-barang">Kembali</Link>

          <h1>{id ? "Edit" : "Tambah"} Data Barang</h1>
        </div>

        <form onSubmit={handleSubmit} className="mb-4">
          <div className="form__box">
            <div className="box">
              <label className="form-label">Kode Barang</label>
              <input
                type="text"
                name="kodeBarang"
                value={formData.kodeBarang}
                className="form-control"
                readOnly
              />
            </div>
            <div className="box">
              <label className="form-label">Nama Barang</label>
              <input
                type="text"
                name="namaBarang"
                value={formData.namaBarang}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
          </div>

          <div className="form__box">
            <div className="box">
              <label className="form-label">Stok</label>
              <input
                type="number"
                name="stok"
                value={formData.stok}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="box">
              <label className="form-label">Tipe</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="form-control"
                required
              >
                <option value="makanan">Makanan</option>
                <option value="minuman">Minuman</option>
              </select>
            </div>

            {formData.type === "minuman" && (
              <div className="box">
                <label className="form-label">Size</label>
                <select
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  className="form-control"
                  required
                >
                  <option value="small">Small</option>
                  <option value="big">Big</option>
                </select>
              </div>
            )}
          </div>

          <div className="form__box">
            <div className="box">
              <label className="form-label">Harga</label>
              <input
                type="number"
                name="harga"
                value={formData.harga}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : id ? "Update" : "Simpan"}
          </button>
        </form>
      </div>
    </section>
  );
}
