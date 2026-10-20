"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSessionClient } from "@/lib/supabase";

export async function login(prevState, formData) {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message || "Email atau password salah. Silakan coba lagi." };
  }

  redirect("/admin");
}

export async function logout() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function changePassword(prevState, formData) {
  const supabase = await createSessionClient();

  // Validasi login di server
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Anda harus masuk terlebih dahulu untuk mengganti password." };
  }

  const passwordBaru = formData.get("password_baru")?.toString() || "";
  const konfirmasiPassword = formData.get("konfirmasi_password")?.toString() || "";

  if (!passwordBaru || passwordBaru.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (passwordBaru !== konfirmasiPassword) {
    return { error: "Password baru dan konfirmasi password harus sama." };
  }

  const { error } = await supabase.auth.updateUser({
    password: passwordBaru,
  });

  if (error) {
    return { error: "Gagal memperbarui password: " + error.message };
  }

  return { success: true, message: "Password berhasil diperbarui." };
}

export async function tambahProduk(formData) {
  const supabase = await createSessionClient();

  // Validasi login di server
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Aksi ditolak: Anda harus login sebagai admin.");
  }

  const nama = formData.get("nama")?.toString().trim();
  const harga = parseInt(formData.get("harga")?.toString() || "0", 10);
  const kategori = formData.get("kategori")?.toString().trim() || null;
  const foto_url = formData.get("foto_url")?.toString().trim() || "/produk/kopi.svg";
  const deskripsi = formData.get("deskripsi")?.toString().trim() || null;

  if (!nama) {
    throw new Error("Nama produk wajib diisi.");
  }

  const { error } = await supabase.from("produk").insert({
    nama,
    harga: isNaN(harga) ? 0 : harga,
    kategori,
    foto_url,
    deskripsi,
  });

  if (error) {
    throw new Error("Gagal menambah produk: " + error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

export async function ubahProduk(formData) {
  const supabase = await createSessionClient();

  // Validasi login di server
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Aksi ditolak: Anda harus login sebagai admin.");
  }

  const id = formData.get("id")?.toString();
  const nama = formData.get("nama")?.toString().trim();
  const harga = parseInt(formData.get("harga")?.toString() || "0", 10);
  const kategori = formData.get("kategori")?.toString().trim() || null;
  const foto_url = formData.get("foto_url")?.toString().trim() || "/produk/kopi.svg";
  const deskripsi = formData.get("deskripsi")?.toString().trim() || null;

  if (!id || !nama) {
    throw new Error("ID dan nama produk wajib diisi.");
  }

  const { error } = await supabase
    .from("produk")
    .update({
      nama,
      harga: isNaN(harga) ? 0 : harga,
      kategori,
      foto_url,
      deskripsi,
    })
    .eq("id", id);

  if (error) {
    throw new Error("Gagal mengubah produk: " + error.message);
  }

  revalidatePath("/admin");
  revalidatePath(`/produk/${id}`);
  revalidatePath("/");
  redirect("/admin");
}

export async function hapusProduk(data) {
  const supabase = await createSessionClient();

  // Validasi login di server
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Aksi ditolak: Anda harus login sebagai admin.");
  }

  const id = typeof data === "object" && data?.get ? data.get("id")?.toString() : data?.toString();
  if (!id) {
    throw new Error("ID produk wajib ada.");
  }

  const { error } = await supabase.from("produk").delete().eq("id", id);

  if (error) {
    throw new Error("Gagal menghapus produk: " + error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/");
}
