
// ===== Pengaturan permainan =====
const DURASI = 30;             // Lama permainan (detik)
const KECEPATAN = 1200;        // Perpindahan setiap 1,2 detik
const CHANCE_MERPATI = 0.25;   // Peluang merpati muncul (25%)

// ===== Ambil elemen dari HTML =====
const grid = document.getElementById("grid");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const bestEl = document.getElementById("best");
const messageEl = document.getElementById("message");
const startBtn = document.getElementById("startBtn");

// ===== Variabel permainan =====
let score = 0;
let time = DURASI;
let aktif = -1;
let jenis = "";
let main = false;
let timerId = null;
let spawnId = null;
let best = 0;

// ===== Simpan dan tampilkan skor terbaik =====
try {
  best = Number(localStorage.getItem("tembak-musuh-best")) || 0;
} catch (e) {}

bestEl.textContent = best;

// ===== Membuat 9 kotak permainan =====
const kotak = [];

for (let i = 0; i < 9; i++) {
  const b = document.createElement("button");

  b.type = "button";
  b.className = "hole";
  b.setAttribute("aria-label", "Kotak " + (i + 1));

  b.addEventListener("click", () => tembak(i));

  grid.appendChild(b);
  kotak.push(b);
}

// ===== Mengosongkan kotak sebelumnya =====
function kosongkan() {
  if (aktif >= 0) {
    kotak[aktif].textContent = "";
    kotak[aktif].classList.remove("up");
    aktif = -1;
  }
}

// ===== Memunculkan bug atau merpati =====
function munculkan() {
  kosongkan();

  const i = Math.floor(Math.random() * 9);

  aktif = i;

  jenis = Math.random() < CHANCE_MERPATI
    ? "merpati"
    : "musuh";

  kotak[i].textContent = jenis === "musuh"
    ? "👾"
    : "🕊️";

  kotak[i].classList.add("up");
}

// ===== Efek ketika gambar diklik =====
function kedip(el, kelas) {
  el.classList.add(kelas);

  setTimeout(() => {
    el.classList.remove(kelas);
  }, 250);
}

// ===== Sistem klik permainan =====
function tembak(i) {

  // Tidak bisa mendapatkan poin dari kotak kosong
  if (!main || i !== aktif) return;

  if (jenis === "musuh") {

    // Bug mendapatkan +1 poin
    score += 1;

    kedip(kotak[i], "hit");

  } else {

    // Merpati mengurangi 2 poin
    score = Math.max(0, score - 2);

    kedip(kotak[i], "miss");
  }

  scoreEl.textContent = score;

  kosongkan();
}

// ===== Memulai permainan =====
function mulai() {

  if (main) return;

  score = 0;
  time = DURASI;
  main = true;

  scoreEl.textContent = score;
  timeEl.textContent = time;

  messageEl.textContent =
    "Tembak 👾 dan hindari 🕊️!";

  startBtn.disabled = true;

  // Munculkan objek pertama
  munculkan();

  // Perpindahan objek setiap 1,2 detik
  spawnId = setInterval(munculkan, KECEPATAN);

  // Hitung mundur waktu permainan
  timerId = setInterval(() => {

    time -= 1;

    timeEl.textContent = time;

    if (time <= 0) {
      selesai();
    }

  }, 1000);
}

// ===== Mengakhiri permainan =====
function selesai() {

  main = false;

  clearInterval(timerId);
  clearInterval(spawnId);

  kosongkan();

  startBtn.disabled = false;
  startBtn.textContent = "Main Lagi";

  // Periksa skor terbaik
  if (score > best) {

    best = score;
    bestEl.textContent = best;

    try {
      localStorage.setItem(
        "tembak-musuh-best",
        best
      );
    } catch (e) {}

    messageEl.textContent =
      "Waktu habis! Skor " + score + ". Rekor baru!";

  } else {

    messageEl.textContent =
      "Waktu habis! Skor kamu " + score + ".";
  }
}

// ===== Tombol mulai =====
startBtn.addEventListener("click", mulai);
