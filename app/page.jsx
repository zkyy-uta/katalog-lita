import Link from "next/link";
import KartuProduk from "@/components/KartuProduk";
import Tombol from "@/components/Tombol";
import { supabaseServer } from "@/lib/supabase";
import { toko } from "@/lib/toko";

export const revalidate = 0;

export default async function HalamanKatalog({ searchParams }) {
  const sp = await searchParams;
  const q = sp?.q?.trim() || "";
  const kategori = sp?.kategori?.trim() || "";

  // Ambil daftar kategori unik dari tabel produk
  const { data: kategoriData } = await supabaseServer
    .from("produk")
    .select("kategori");

  const daftarKategori = Array.from(
    new Set(kategoriData?.map((item) => item.kategori).filter(Boolean))
  );

  // Buat query produk sesuai search & filter kategori
  let query = supabaseServer
    .from("produk")
    .select("*")
    .order("created_at", { ascending: false });

  if (q) {
    query = query.ilike("nama", `%${q}%`);
  }

  if (kategori && kategori !== "Semua") {
    query = query.eq("kategori", kategori);
  }

  const { data: daftarProduk, error } = await query;

  return (
    <>
      <section className="py-10 sm:py-14">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {toko.nama}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-teks-lembut">{toko.tagline}</p>
        <p className="mt-4 text-sm text-teks-lembut">{toko.jamBuka}</p>
      </section>

      <section aria-labelledby="judul-produk" className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="judul-produk" className="text-xl font-bold">
            Produk kami
          </h2>

          {/* Form Pencarian */}
          <form method="GET" action="/" className="flex max-w-md flex-1 gap-2">
            {kategori && <input type="hidden" name="kategori" value={kategori} />}
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Cari nama produk..."
              className="w-full rounded-lg border border-garis bg-latar px-3.5 py-2 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
            />
            <Tombol type="submit" varian="utama">
              Cari
            </Tombol>
            {(q || kategori) && (
              <Tombol href="/" varian="garis">
                Reset
              </Tombol>
            )}
          </form>
        </div>

        {/* Filter Kategori */}
        {daftarKategori.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={q ? `/?q=${encodeURIComponent(q)}` : "/"}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                !kategori || kategori === "Semua"
                  ? "bg-utama text-white"
                  : "border border-garis bg-permukaan text-teks-lembut hover:text-utama"
              }`}
            >
              Semua
            </Link>
            {daftarKategori.map((kat) => {
              const isActive = kategori === kat;
              const href = q
                ? `/?q=${encodeURIComponent(q)}&kategori=${encodeURIComponent(kat)}`
                : `/?kategori=${encodeURIComponent(kat)}`;

              return (
                <Link
                  key={kat}
                  href={href}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-utama text-white"
                      : "border border-garis bg-permukaan text-teks-lembut hover:text-utama"
                  }`}
                >
                  {kat}
                </Link>
              );
            })}
          </div>
        )}

        {/* Daftar Produk */}
        {error ? (
          <p className="text-bahaya">Gagal memuat daftar produk: {error.message}</p>
        ) : !daftarProduk || daftarProduk.length === 0 ? (
          <p className="text-teks-lembut">
            {q || kategori
              ? "Tidak ada produk yang sesuai dengan pencarian atau filter."
              : "Belum ada produk"}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {daftarProduk.map((produk) => (
              <KartuProduk key={produk.id} produk={produk} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
