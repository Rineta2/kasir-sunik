import Image from "next/image";

import deleteImg from "@/components/assets/transaction/delete.png";

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
}) {
  if (!isOpen) return null;

  return (
    <div className={`modal ${isOpen ? "open" : ""}`}>
      <div className="box">
        <Image
          src={deleteImg}
          alt="delete"
          width={400}
          height={400}
          quality={100}
        />
        <p>Apakah Anda yakin ingin menghapus transaksi ini?</p>

        <div className="actions">
          <button className="btn-cancel" onClick={onClose}>
            Batal
          </button>
          <button className="btn-delete" onClick={onConfirm}>
            Hapus
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          width: 90%;
          max-width: 400px;
        }

        h2 {
          margin-bottom: 1rem;
        }

        .modal-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 20px;
        }

        .btn-cancel {
          padding: 8px 16px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: #fff;
          cursor: pointer;
        }

        .btn-delete {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          background-color: #dc3545;
          color: white;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
