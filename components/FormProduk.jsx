"use client";

import { useState } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { buatDeskripsiAI } from "@/app/admin/actions";

// Dipakai untuk tambah produk (US-08) dan ubah produk (US-09).
// Dilengkapi fitur generator AI (US-14).
export default function FormProduk({ produk = {}, labelTombol, action }) {
  const [deskripsi, setDeskripsi] = useState(produk.deskripsi || "");
  const [loadingAI, setLoadingAI] = useState(false);
  const [pesanErrorAI, setPesanErrorAI] = useState("");

  const handleBuatAI = async (e) => {
    e.preventDefault();
    setPesanErrorAI("");

    const form = e.currentTarget.closest("form");
    const nama = form?.elements?.["nama"]?.value?.trim();
    const kategori = form?.elements?.["kategori"]?.value?.trim();

    if (!nama) {
      setPesanErrorAI("Silakan isi nama produk terlebih dahulu.");
      return;
    }

    setLoadingAI(true);
    try {
      const res = await buatDeskripsiAI(nama, kategori);
      if (res?.deskripsi) {
        setDeskripsi(res.deskripsi);
      }
    } catch (err) {
      setPesanErrorAI(err.message || "Gagal membuat deskripsi AI.");
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <form action={action} className="flex max-w-xl flex-col gap-4">
      {produk.id && <input type="hidden" name="id" value={produk.id} />}
      <Input label="Nama produk" name="nama" defaultValue={produk.nama} required />
      <Input
        label="Harga (Rp)"
        name="harga"
        type="number"
        min="0"
        defaultValue={produk.harga}
        required
      />
      <Input label="Kategori" name="kategori" defaultValue={produk.kategori} />
      <Input
        label="Link foto"
        name="foto_url"
        placeholder="https://... atau /produk/nama-file.svg"
        defaultValue={produk.foto_url}
      />

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="input-deskripsi" className="text-sm font-semibold text-teks">
            Deskripsi
          </label>
          <button
            type="button"
            onClick={handleBuatAI}
            disabled={loadingAI}
            className="inline-flex items-center gap-1.5 rounded-lg border border-garis bg-permukaan px-2.5 py-1 text-xs font-semibold text-utama transition hover:border-utama disabled:opacity-50"
          >
            {loadingAI ? "Sedang membuat..." : "✨ Buat dengan AI"}
          </button>
        </div>
        {pesanErrorAI && (
          <p className="text-xs text-bahaya">{pesanErrorAI}</p>
        )}
        <textarea
          id="input-deskripsi"
          name="deskripsi"
          rows={4}
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          placeholder="Tulis deskripsi atau klik 'Buat dengan AI'..."
          className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
        />
      </div>

      <div className="flex gap-3">
        <Tombol type="submit">{labelTombol}</Tombol>
        <Tombol href="/admin" varian="garis">
          Batal
        </Tombol>
      </div>
    </form>
  );
}
