"use client";

import { useState } from "react";
import { toko } from "@/lib/toko";
import { formatRupiah } from "@/lib/format";

export default function TombolWhatsApp({ produk }) {
  const [jumlah, setJumlah] = useState(1);
  const [varian, setVarian] = useState("Standar");

  const nomor = (toko.nomorWhatsApp || "").replace(/\D/g, "");
  const totalHarga = (produk?.harga || 0) * jumlah;

  // Bangun pesan otomatis dengan jumlah dan varian
  const bagianVarian = varian && varian !== "Standar" ? ` (Varian: ${varian})` : "";
  const pesan = `Halo, saya ingin memesan ${produk?.nama || "produk"}${bagianVarian} sebanyak ${jumlah} pcs seharga total ${formatRupiah(totalHarga)}.`;
  const url = `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;

  const kurangJumlah = () => {
    if (jumlah > 1) setJumlah((prev) => prev - 1);
  };

  const tambahJumlah = () => {
    setJumlah((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Pilihan Jumlah & Varian */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-garis bg-permukaan p-4 sm:gap-6">
        {/* Kontrol Jumlah */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-teks-lembut">Jumlah</label>
          <div className="flex items-center rounded-lg border border-garis bg-latar">
            <button
              type="button"
              onClick={kurangJumlah}
              disabled={jumlah <= 1}
              className="flex h-9 w-9 items-center justify-center text-lg font-bold text-teks transition hover:bg-permukaan disabled:opacity-40"
              aria-label="Kurang jumlah"
            >
              −
            </button>
            <input
              type="number"
              min="1"
              value={jumlah}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setJumlah(isNaN(val) || val < 1 ? 1 : val);
              }}
              className="h-9 w-12 text-center text-sm font-semibold text-teks focus:outline-none"
            />
            <button
              type="button"
              onClick={tambahJumlah}
              className="flex h-9 w-9 items-center justify-center text-lg font-bold text-teks transition hover:bg-permukaan"
              aria-label="Tambah jumlah"
            >
              +
            </button>
          </div>
        </div>

        {/* Pilihan Varian */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-teks-lembut">Varian</label>
          <select
            value={varian}
            onChange={(e) => setVarian(e.target.value)}
            className="h-9 rounded-lg border border-garis bg-latar px-3 text-sm font-semibold text-teks focus:border-utama focus:outline-none"
          >
            <option value="Standar">Standar</option>
            <option value="Ukuran Kecil">Ukuran Kecil</option>
            <option value="Ukuran Sedang">Ukuran Sedang</option>
            <option value="Ukuran Besar">Ukuran Besar</option>
            <option value="Ekstra">Ekstra</option>
          </select>
        </div>

        {/* Total Harga */}
        <div className="ml-auto flex flex-col items-end">
          <span className="text-xs text-teks-lembut">Total harga</span>
          <span className="text-base font-extrabold text-harga">{formatRupiah(totalHarga)}</span>
        </div>
      </div>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-full items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white transition hover:bg-utama-gelap sm:w-auto"
      >
        Pesan via WhatsApp
      </a>
    </div>
  );
}
