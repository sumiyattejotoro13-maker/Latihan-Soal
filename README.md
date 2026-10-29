# DO IT 4 BETTER ENGLISH LEARNER — Genius Assessment

Aplikasi asesmen statis untuk Bahasa Inggris SMK Kelas X, materi **Asking and Giving Opinion** dan **Describing an Object**. Dibangun dengan HTML, CSS, JavaScript, dan Bootstrap 5.3.3; dapat di-host di GitHub Pages.

## Isi folder

- `index.html` — struktur halaman, formulir identitas, layar soal, hasil.
- `styles.css` — gaya responsif dan animasi ringan.
- `questions.js` — data 25 soal dan kunci jawaban.
- `app.js` — validasi, pengacakan, timer, penguncian jawaban, umpan balik, dan perhitungan nilai.

## Menjalankan secara lokal

Cara paling mudah: buka `index.html` di browser modern. Untuk menghindari pembatasan file lokal di sebagian lingkungan, jalankan server lokal dari folder ini:

```bash
python -m http.server 8000
```

Lalu buka `http://localhost:8000`.

Bootstrap dan font opsional dimuat dari CDN, sehingga koneksi internet diperlukan untuk memuat aset tersebut. Logika asesmen dan data soal berada di file lokal.

## Publikasi melalui GitHub Pages

1. Buat repository baru di GitHub, misalnya `genius-assessment-english`.
2. Unggah keempat file (`index.html`, `styles.css`, `app.js`, `questions.js`) ke root repository. Sertakan `README.md` bila diperlukan.
3. Buka **Settings → Pages** pada repository.
4. Pada **Build and deployment**, pilih **Deploy from a branch**.
5. Pilih branch `main` dan folder `/(root)`, lalu klik **Save**.
6. Tunggu proses deployment selesai. URL situs akan tampil di bagian Pages, umumnya `https://USERNAME.github.io/REPOSITORY/`.
7. Buka URL tersebut dan uji dari HP serta komputer.

Setiap perubahan yang di-push ke branch dan folder sumber Pages akan dipublikasikan kembali secara otomatis.

## Perilaku aplikasi

- Semua identitas wajib diisi; nama minimal 2 karakter, NIS 2–30 karakter, kelas 1–30 karakter.
- Timer 90 menit mulai ketika siswa menekan **Mulai Asesmen**.
- Urutan soal diacak setiap sesi. Pilihan diacak secara independen; setiap opsi tetap menyimpan identitas pilihan asli sehingga kunci jawaban tidak berubah.
- Satu soal ditampilkan per layar. Pilihan langsung dikunci setelah dipilih dan umpan balik ditampilkan.
- Waktu habis akan menghentikan asesmen dan menampilkan hasil. Soal yang tidak dijawab dihitung sebagai salah/kosong.
- Nilai akhir = (jumlah benar / 25) × 100.
- Tombol **Cetak / Simpan PDF** membuka dialog cetak browser.

## Penting: privasi dan integritas asesmen

Ini adalah aplikasi statis sisi-klien. Data siswa dan hasil hanya diproses di browser dan **tidak dikirim atau disimpan ke server**. Hasil akan hilang saat halaman dimuat ulang/ditutup. GitHub Pages tidak menyediakan penyimpanan nilai atau autentikasi secara bawaan.

Karena kunci jawaban harus tersedia bagi JavaScript sisi-klien untuk menilai jawaban, siswa yang memahami developer tools dapat memeriksa file sumber. Untuk ujian berisiko tinggi, tambahkan backend/API dengan autentikasi dan penilaian di server.

## Menyesuaikan bank soal

Edit `questions.js`. Setiap soal mengikuti struktur:

```js
{
  id: 1,
  topic: "Asking and Giving Opinion",
  difficulty: "Mudah",
  question: "Teks pertanyaan",
  options: [
    ["A", "Opsi A"],
    ["B", "Opsi B"],
    ["C", "Opsi C"],
    ["D", "Opsi D"],
    ["E", "Opsi E"]
  ],
  answer: "A",
  explanation: "Pembahasan singkat."
}
```

Pastikan nilai `answer` sama dengan salah satu label opsi asli, `id` unik, dan jumlah soal sesuai konstanta `TOTAL_QUESTIONS` di `app.js`.
