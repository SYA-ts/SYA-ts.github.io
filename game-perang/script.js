// ===== Pengaturan (boleh diubah-ubah buat coba-coba) =====
const DURASI = 30;        // lama game (detik)
const KECEPATAN = 750;    // musuh ganti posisi tiap berapa milidetik
const CHANCE_MERPATI = 0.25; // peluang yang muncul merpati (0.25 = 25%)

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
let aktif = -1;      // nomor kotak yang lagi ada isinya (-1 = kosong)
let jenis = "";      // "musuh" atau "merpati"
let main = false;
let timerId = null;
let spawnId = null;
let best = 0;

// Skor terbaik disimpan di browser. try/catch biar nggak error kalau diblokir.
try {
  best = Number(localStorage.getItem("tembak-musuh-best")) || 0;
} catch (e) {}
bestEl.textContent = best;

// ===== Bikin 9 kotak =====
const kotak = [];
for (let i = 0; i < 9; i++) {
  const b = document.createElement("button");
  b.className = "hole";
  b.setAttribute("aria-label", "Kotak " + (i + 1));
  b.addEventListener("click", () => tembak(i));
  grid.appendChild(b);
  kotak.push(b);
}

// ===== Fungsi-fungsi =====
function kosongkan() {
  if (aktif >= 0) {
    kotak[aktif].textContent = "";
    kotak[aktif].classList.remove("up");
    aktif = -1;
  }
}

function munculkan() {
  kosongkan();
  let i;
  do {
    i = Math.floor(Math.random() * 9);
  } while (i === aktif);
  aktif = i;
  jenis = Math.random() < CHANCE_MERPATI ? "merpati" : "musuh";
  kotak[i].textContent = jenis === "musuh" ? "👾" : "🕊️";
  kotak[i].classList.add("up");
}

function kedip(el, kelas) {
  el.classList.add(kelas);
  setTimeout(() => el.classList.remove(kelas), 150);
}

function tembak(i) {
  if (!main || i !== aktif) return;

  if (jenis === "musuh") {
    score += 1;
    kedip(kotak[i], "hit");
  } else {
    score = Math.max(0, score - 2);
    kedip(kotak[i], "miss");
  }
  scoreEl.textContent = score;
  kosongkan();
}

function mulai() {
  score = 0;
  time = DURASI;
  main = true;
  scoreEl.textContent = score;
  timeEl.textContent = time;
  messageEl.textContent = "Tembak yang cepat!";
  startBtn.disabled = true;

  munculkan();
  spawnId = setInterval(munculkan, KECEPATAN);
  timerId = setInterval(() => {
    time -= 1;
    timeEl.textContent = time;
    if (time <= 0) selesai();
  }, 1000);
}

function selesai() {
  main = false;
  clearInterval(timerId);
  clearInterval(spawnId);
  kosongkan();
  startBtn.disabled = false;
  startBtn.textContent = "Main Lagi";

  if (score > best) {
    best = score;
    bestEl.textContent = best;
    try {
      localStorage.setItem("tembak-musuh-best", best);
    } catch (e) {}
    messageEl.textContent = "Waktu habis! Skor " + score + ". Rekor baru!";
  } else {
    messageEl.textContent = "Waktu habis! Skor lu " + score + ".";
  }
}

startBtn.addEventListener("click", mulai);
