export type NamaObjek = "apel" | "matahari" | "ikan" | "daun" | "jeruk" | "anggur";

export type Warna = {
  /** ID untuk file narasi, mis. "merah" -> public/narasi/merah-nama.mp3 */
  id: string;
  /** Nama warna dalam Bahasa Indonesia */
  nama: string;
  /** Nama warna dalam Bahasa Inggris (bonus belajar) */
  english: string;
  /** Warna utama */
  hex: string;
  /** Warna latar yang lebih muda */
  latar: string;
  /** Objek contoh yang digambar */
  objek: NamaObjek;
  /** Kalimat contoh, mis. "Apel berwarna merah" */
  kalimat: string;
};

export const DAFTAR_WARNA: Warna[] = [
  { id: "merah", nama: "Merah", english: "Red", hex: "#E53935", latar: "#FFEBEE", objek: "apel", kalimat: "Apel berwarna merah" },
  { id: "kuning", nama: "Kuning", english: "Yellow", hex: "#FDD835", latar: "#FFFDE7", objek: "matahari", kalimat: "Matahari berwarna kuning" },
  { id: "biru", nama: "Biru", english: "Blue", hex: "#1E88E5", latar: "#E3F2FD", objek: "ikan", kalimat: "Ikan ini berwarna biru" },
  { id: "hijau", nama: "Hijau", english: "Green", hex: "#43A047", latar: "#E8F5E9", objek: "daun", kalimat: "Daun berwarna hijau" },
  { id: "oranye", nama: "Oranye", english: "Orange", hex: "#FB8C00", latar: "#FFF3E0", objek: "jeruk", kalimat: "Jeruk berwarna oranye" },
  { id: "ungu", nama: "Ungu", english: "Purple", hex: "#8E24AA", latar: "#F3E5F5", objek: "anggur", kalimat: "Anggur berwarna ungu" },
];

export const FPS = 30;
export const DURASI_TRANSISI = 15;
