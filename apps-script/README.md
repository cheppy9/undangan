# Deploy Buku Ucapan ke Google Apps Script

Panduan ini menghubungkan form di undangan dengan Google Spreadsheet. Pesan baru disimpan sebagai `pending`; hanya pesan yang Anda ubah menjadi `approved` yang ditampilkan kepada pengunjung.

Yang diperlukan:

- Akun Google yang akan memiliki Spreadsheet dan Apps Script.
- File project undangan, termasuk [Code.gs](Code.gs) dan [wishes.js](../wishes.js).
- Akses internet saat menjalankan setup dan mengetes undangan.

## 1. Buat Spreadsheet dan Script

1. Buka [Google Apps Script](https://script.google.com/home/start), lalu login dengan akun Google pengelola.
2. Pilih **New project** dan beri nama, misalnya `Buku Ucapan Sheka dan Cheppy`.
3. Di editor Apps Script, buka `Code.gs`, hapus contoh fungsi yang ada, lalu salin seluruh isi file [apps-script/Code.gs](Code.gs) ke editor.
4. Klik **Save**.
5. Pada pilihan fungsi di toolbar, pilih `setupWishesSpreadsheet`, lalu klik **Run**.
6. Saat diminta, tinjau izin Google Sheets dan lanjutkan dengan akun pengelola.
7. Buka **Execution log**. Salin URL Spreadsheet yang tercatat, lalu buka untuk memastikan tab `Ucapan` dengan kolom `Waktu`, `Nama`, `Ucapan`, dan `Status` sudah dibuat.

Jalankan `setupWishesSpreadsheet` hanya satu kali. Menjalankannya lagi akan membuat Spreadsheet baru dan mengalihkan Script Properties ke Spreadsheet tersebut.

Jangan ubah akses Spreadsheet menjadi publik. Pengelola cukup membukanya dari akun Google yang menjalankan Apps Script.

### Contoh format tab `Ucapan`

Script membuat header ini secara otomatis:

| Waktu               | Nama  | Ucapan                                       | Status   |
| ------------------- | ----- | -------------------------------------------- | -------- |
| 2026-12-01 14:30:00 | Rani  | Semoga selalu bahagia dan saling menguatkan. | pending  |
| 2026-12-01 15:00:00 | Dimas | Selamat menempuh perjalanan baru bersama.    | approved |

Baris di atas hanya contoh, tidak perlu dimasukkan ke Spreadsheet. Setiap kiriman tamu otomatis mengisi `Waktu`, `Nama`, dan `Ucapan`, lalu diberi status `pending`. Pengelola cukup mengganti kolom `Status` menjadi `approved` untuk menampilkan pesan di undangan. Biarkan nama kolom dan urutannya tetap seperti contoh.

## 2. Deploy sebagai Web App

1. Di Apps Script, klik **Deploy > New deployment**.
2. Klik ikon pengaturan tipe deployment, lalu pilih **Web app**.
3. Isi deskripsi, misalnya `Buku ucapan undangan`.
4. Atur **Execute as** menjadi **Me** agar script menyimpan data menggunakan izin akun pengelola.
5. Atur **Who has access** menjadi **Anyone** agar tamu tidak diminta login Google.
6. Klik **Deploy** dan selesaikan otorisasi jika diminta.
7. Salin URL Web App yang berakhiran `/exec`. Simpan URL ini; jangan gunakan URL `/dev` untuk undangan publik.

Jika pilihan **Anyone** tidak tersedia, kebijakan akun Google Workspace mungkin membatasi Web App publik. Coba akun Google pribadi atau minta administrator Workspace mengizinkan deployment publik.

## 3. Hubungkan ke Undangan

1. Buka file [wishes.js](../wishes.js) di project undangan.
2. Pada baris pertama, ganti nilai kosong `APPS_SCRIPT_URL` dengan URL `/exec` yang baru disalin. Pertahankan tanda petik tunggal, contohnya:

   ```js
   const APPS_SCRIPT_URL =
     'https://script.google.com/macros/s/ID_DEPLOYMENT_ANDA/exec';
   ```

3. Simpan file, lalu muat ulang halaman undangan. Status “Form akan aktif setelah spreadsheet ucapan terhubung” seharusnya tidak muncul lagi dan daftar ucapan mulai dimuat.

URL Web App ini bersifat publik. Siapa pun yang memiliki URL dapat mengirim permintaan; script membatasi panjang nama/pesan dan memasukkan kiriman ke status `pending`. Endpoint daftar publik hanya mengirim nama dan pesan yang berstatus `approved`. Karena pesan approved tampil untuk semua pengunjung, jangan minta atau menyetujui informasi pribadi/sensitif.

## 4. Moderasi dan Tes

1. Kirim ucapan percobaan melalui undangan.
2. Buka Spreadsheet. Pastikan ucapan masuk ke tab `Ucapan` dengan status `pending`.
3. Muat ulang undangan. Pastikan pesan `pending` belum tampil.
4. Ubah status pesan tersebut menjadi `approved`, lalu muat ulang undangan. Pastikan nama dan pesan muncul sebagai teks.
5. Untuk memastikan pesan tidak diperlakukan sebagai HTML, kirim teks biasa seperti `<b>tes</b>`; teks tersebut seharusnya tampil apa adanya.
6. Opsional: isi kolom tersembunyi `Website` saat pengujian. Kiriman honeypot seharusnya tidak membuat baris baru.

## 5. Perbarui Deployment

Jika `Code.gs` berubah setelah deployment:

1. Klik **Deploy > Manage deployments**.
2. Pilih deployment Web App, lalu klik **Edit**.
3. Pada pilihan versi, pilih **New version**, lalu klik **Deploy**.
4. Gunakan URL `/exec` yang sama. Jika URL berubah, perbarui juga `APPS_SCRIPT_URL` di `wishes.js`.

## Pemecahan Masalah

- **Tombol kirim nonaktif:** pastikan `APPS_SCRIPT_URL` berisi URL `/exec`, bukan string kosong atau URL `/dev`.
- **Tamu diminta login:** periksa **Who has access** dan pilih **Anyone**, jika diizinkan oleh akun.
- **Daftar ucapan gagal dimuat:** pastikan setup pernah dijalankan, deployment memakai versi terbaru, dan URL `/exec` benar.
- **Ucapan tidak muncul:** periksa kolom Status. Hanya nilai `approved` yang ditampilkan.
- **Script tidak menemukan Spreadsheet:** jalankan `setupWishesSpreadsheet` sekali lagi hanya bila Script Properties atau Spreadsheet sebelumnya terhapus; perhatikan bahwa tindakan ini membuat Spreadsheet baru.

Dokumentasi resmi: [Deploy Apps Script sebagai Web App](https://developers.google.com/apps-script/guides/web).
