import React, { useState } from "react";
import "./PopUpHasilSimulasi.css";

function PopUpHasilSimulasi({ open, onClose, hasilSimulasi }) {
  const [loading, setLoading] = useState(false);

  if (!open || !hasilSimulasi) return null;

  // Mengubah nama properti menjadi lebih mudah dibaca
  const formatLabel = (label) => {
    return label
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  // Mengunduh hasil simulasi dalam format CSV   
        const handleDownloadCSV = () => {
        if (loading) return;

        setLoading(true);

        const data = Object.entries(hasilSimulasi);

        const csvContent = [
            ["Parameter", "Hasil"],
            ...data.map(([key, value]) => [
            formatLabel(key),
            value ?? "-"
            ])
        ]
            .map((row) =>
            row
                .map((value) => `"${String(value).replace(/"/g, '""')}"`)
                .join(",")
            )
            .join("\n");

        const blob = new Blob(["\uFEFF" + csvContent], {
            type: "text/csv;charset=utf-8;"
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "Hasil_Simulasi_VLabVerse.csv";
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);

        setTimeout(() => {
            URL.revokeObjectURL(url);
            setLoading(false);
        }, 1000);
        };
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div
        className="popup-hasil"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="popup-close" onClick={onClose}>
          &times;
        </button>

        <div className="popup-icon">
          <span>✓</span>
        </div>

        <h2>Simulasi Berhasil!</h2>
        <p className="popup-subtitle">
          Berikut merupakan hasil perhitungan simulasi
          laju bakar propelan Anda.
        </p>

        <div className="hasil-container">
        <table className="tabel-hasil">
            <thead>
            <tr>
                <th>No</th>
                <th>Parameter</th>
                <th>Hasil</th>
            </tr>
            </thead>

            <tbody>
            {Object.entries(hasilSimulasi).map(([key, value], index) => (
                <tr key={key}>
                <td>{index + 1}</td>
                <td>{formatLabel(key)}</td>
                <td>
                    {typeof value === "object" && value !== null
                    ? JSON.stringify(value)
                    : value ?? "-"}
                </td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>

        <div className="popup-actions">
        <button
        className="btn-unduh"
        onClick={handleDownloadCSV}
        disabled={loading}
        >
        {loading ? (
            <>
            <span className="loading-spinner"></span>
            Menyiapkan file...
            </>
        ) : (
            <>
            <span>↓</span>
            Unduh CSV
            </>
        )}
        </button>

          <button className="btn-tutup" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

export default PopUpHasilSimulasi;
