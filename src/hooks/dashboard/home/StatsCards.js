import React from "react";
import {
  FaShoppingCart,
  FaMoneyBillWave,
  FaChartLine,
  FaBoxes,
} from "react-icons/fa";

export function StatsCards({ stats }) {
  return (
    <>
      <div className="content">
        <div className="card">
          <div className="card-body">
            <div className="text">
              <h6>Transaksi Hari Ini</h6>
              <h3>{stats.todayTransactions}</h3>
            </div>
            <div className="icons">
              <FaShoppingCart size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="text">
              <h6>Pendapatan Hari Ini</h6>
              <h3>Rp {stats.todayIncome.toLocaleString()}</h3>
            </div>
            <div className="icons">
              <FaMoneyBillWave size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="text">
              <h6>Pendapatan Bulan Ini</h6>
              <h3>Rp {stats.monthlyIncome.toLocaleString()}</h3>
            </div>
            <div className="icons">
              <FaChartLine size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="text">
            <h6>Total Produk</h6>
            <h3>{stats.totalProducts}</h3>
          </div>
          <div className="icons">
            <FaBoxes size={24} />
          </div>
        </div>
      </div>
    </>
  );
}
