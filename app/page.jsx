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
  const urutan = sp?.urutan?.trim() || "terbaru";

  // Ambil daftar kategori unik dari tabel produk
  const { data: kategoriData } = await supabaseServer
    .from("produk")
    .select("kategori");

  const daftarKategori = Array.from(
    new Set(kategoriData?.map((item) => item.kategori).filter(Boolean))
  );

  // Buat query produk sesuai search, filter kategori, dan urutan (US-15)
  let query = supabaseServer.from("produk").select("*");

  if (q) {
    query = query.ilike("nama", `%${q}%`);
  }

  if (kategori && kategori !== "Semua") {
    query = query.eq("kategori", kategori);
  }

  // Urutan diterapkan saat query database (US-15)
  if (urutan === "termurah") {
    query = query.order("harga", { ascending: true });
  } else if (urutan === "termahal") {
    query = query.order("harga", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data: daftarProduk, error } = await query;

  // Helper untuk membuat URL dengan parameter aktif
  const buatUrl = ({ newQ = q, newKategori = kategori, newUrutan = urutan }) => {
    const params = new URLSearchParams();
    if (newQ) params.set("q", newQ);
    if (newKategori && newKategori !== "Semua") params.set("kategori", newKategori);
    if (newUrutan && newUrutan !== "terbaru") params.set("urutan", newUrutan);
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  };

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
            {urutan && urutan !== "terbaru" && <input type="hidden" name="urutan" value={urutan} />}
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
            {(q || kategori || urutan !== "terbaru") && (
              <Tombol href="/" varian="garis">
                Reset
              </Tombol>
            )}
          </form>
        </div>

        {/* Baris Filter Kategori & Urutan Produk (US-11 & US-15) */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-garis pb-4">
          {/* Filter Kategori */}
          {daftarKategori.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={buatUrl({ newKategori: "Semua" })}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-colors ${
                  !kategori || kategori === "Semua"
                    ? "bg-utama text-white"
                    : "border border-garis bg-permukaan text-teks-lembut hover:text-utama"
                }`}
              >
                Semua
              </Link>
              {daftarKategori.map((kat) => {
                const isActive = kategori === kat;
                return (
                  <Link
                    key={kat}
                    href={buatUrl({ newKategori: kat })}
                    className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-colors ${
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

          {/* Pilihan Urutan Produk (US-15) */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="text-xs font-medium text-teks-lembut">Urutan:</span>
            {[
              { label: "Terbaru", value: "terbaru" },
              { label: "Termurah", value: "termurah" },
              { label: "Termahal", value: "termahal" },
            ].map((opt) => {
              const isActive = urutan === opt.value;
              return (
                <Link
                  key={opt.value}
                  href={buatUrl({ newUrutan: opt.value })}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-harga-latar text-harga"
                      : "text-teks-lembut hover:bg-permukaan hover:text-teks"
                  }`}
                >
                  {opt.label}
                </Link>
              );
            })}
          </div>
        </div>

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
