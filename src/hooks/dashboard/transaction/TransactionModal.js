import React from "react";

import "@/components/styles/Dashboard.scss";

import img from "@/components/assets/transaction/img.png";

import Image from "next/image";

const TransactionModal = ({ isOpen, onClose, total, payment, change }) => {
  if (!isOpen) return null;

  const formatNumber = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="model">
      <div className="box">
        <Image src={img} alt="img" width={500} height={500} quality={100} />
        <h2>Pembayaran Berhasil</h2>
        <p>Kembalian: Rp {formatNumber(change)}</p>
        <button onClick={onClose}>Ya</button>
      </div>
    </div>
  );
};

export default TransactionModal;
