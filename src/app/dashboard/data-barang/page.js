"use client";
import React, { useState, useEffect } from "react";

import { db } from "@/utils/lib/firebase";

import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

import { useRouter } from "next/navigation";

import "@/components/styles/Dashboard.scss";

export default function DataBarang() {
  const router = useRouter();

  const [barang, setBarang] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [filterKategori, setFilterKategori] = useState("semua");

  const [isLoading, setIsLoading] = useState(true);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchBarang = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "dataBarang"));
      const newData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBarang(newData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBarang();
  }, []);

  const handleEdit = (item) => {
    router.push(`/dashboard/data-barang/form?id=${item.id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus item ini?")) {
      try {
        await deleteDoc(doc(db, "dataBarang", id));
        await fetchBarang();
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const filteredBarang = barang.filter((item) => {
    const searchQuery = searchTerm.toLowerCase().trim();

    if (filterKategori !== "semua" && item.type !== filterKategori) {
      return false;
    }

    if (!searchQuery) return true;

    const hargaString = Number(item.harga).toLocaleString();
    const stokString = String(item.stok);
    const namaBarang = item.namaBarang?.toLowerCase() || "";
    const kodeBarang = item.kodeBarang?.toLowerCase() || "";
    const size = item.size?.toLowerCase() || "";

    return (
      namaBarang.includes(searchQuery) ||
      kodeBarang.includes(searchQuery) ||
      hargaString.includes(searchQuery) ||
      stokString.includes(searchQuery) ||
      size.includes(searchQuery)
    );
  });

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedBarang = React.useMemo(() => {
    let sortableItems = [...filteredBarang];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredBarang, sortConfig]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedBarang.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedBarang.length / itemsPerPage);

  const renderSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "asc" ? " ↑" : " ↓";
    }
    return "";
  };

  return (
    <section className="data__barang">
      <div className="barang__container container">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "2rem",
            alignItems: "center",
          }}
          className="heading"
        >
          <h1>Data Barang</h1>

          <button
            className="btn"
            onClick={() => router.push("/dashboard/data-barang/form")}
          >
            Tambah Barang
          </button>
        </div>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <input
            type="text"
            className="form-control"
            placeholder="Cari berdasarkan nama atau kode barang..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="form-select"
            style={{ width: "auto" }}
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
          >
            <option value="semua">Semua Kategori</option>
            <option value="makanan">Makanan</option>
            <option value="minuman">Minuman</option>
          </select>
        </div>

        <div className="table-responsive">
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "4rem" }}>
              <div className="spinner-border" role="status"></div>
            </div>
          ) : (
            <>
              <table className="table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th
                      onClick={() => handleSort("kodeBarang")}
                      style={{ cursor: "pointer" }}
                    >
                      Kode Barang {renderSortIndicator("kodeBarang")}
                    </th>
                    <th
                      onClick={() => handleSort("namaBarang")}
                      style={{ cursor: "pointer" }}
                    >
                      Nama Barang {renderSortIndicator("namaBarang")}
                    </th>
                    <th
                      onClick={() => handleSort("size")}
                      style={{ cursor: "pointer" }}
                    >
                      Size {renderSortIndicator("size")}
                    </th>
                    <th
                      onClick={() => handleSort("harga")}
                      style={{ cursor: "pointer" }}
                    >
                      Harga {renderSortIndicator("harga")}
                    </th>
                    <th
                      onClick={() => handleSort("stok")}
                      style={{ cursor: "pointer" }}
                    >
                      Stok {renderSortIndicator("stok")}
                    </th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item, index) => (
                    <tr key={item.id}>
                      <td>{indexOfFirstItem + index + 1}</td>
                      <td>{item.kodeBarang}</td>
                      <td>{item.namaBarang}</td>
                      <td>{item.size || "-"}</td>
                      <td>Rp {Number(item.harga).toLocaleString()}</td>
                      <td>{item.stok}</td>
                      <td
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <button
                          onClick={() => handleEdit(item)}
                          className="edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="delete"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "3rem",
                }}
              >
                <div>
                  Showing {indexOfFirstItem + 1} to{" "}
                  {Math.min(indexOfLastItem, sortedBarang.length)} of{" "}
                  {sortedBarang.length} entries
                </div>

                <nav>
                  <ul className="pagination">
                    <li
                      className={`page-item ${
                        currentPage === 1 ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                      >
                        Previous
                      </button>
                    </li>
                    {[...Array(totalPages)].map((_, i) => (
                      <li
                        key={i}
                        className={`page-item ${
                          currentPage === i + 1 ? "active" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    <li
                      className={`page-item ${
                        currentPage === totalPages ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
