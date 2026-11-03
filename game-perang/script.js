
// ===== Pengaturan permainan =====
const DURASI = 60;
const KECEPATAN_AWAL = 1200;
const KECEPATAN_MINIMUM = 450;
const PENGURANG_KECEPATAN = 150;
const CHANCE_MERPATI = 0.25;

const TARGET_COMBO = 5;
const BONUS_WAKTU = 2;
const BATAS_COMBO = 1500;

// ===== Ambil elemen HTML =====
const grid = document.getElementById("grid");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const bestEl = document.getElementById("best");
const messageEl = document.getElementById("message");
const startBtn = document.getElementById("startBtn");

// ===== Variabel permainan =====
let score = 0;
let time = DURASI;
let main = false;

let timerId = null;
let spawnId = null;
let comboId = null;

let best = 0;
let combo = 0;
let waktuMulai = 0;

// Menyimpan objek yang sedang muncul
let objekAktif = new Map();

// ===== Ambil skor terbaik =====
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

// ===== Menghapus objek dari papan =====
function kosongkan() {
  objekAktif.forEach((jenis, index) => {
    kotak[index].textContent = "";
    kotak[index].classList.remove("up");
  });

  objekAktif.clear();
}

// ===== Menghitung kecepatan permainan =====
function hitungKecepatan() {
  const elapsed = Math.floor(
    (Date.now() - waktuMulai) / 10000
  );

  return Math.max(
    KECEPATAN_MINIMUM,
    KECEPATAN_AWAL - (elapsed * PENGURANG_KECEPATAN)
  );
}

// ===== Menghitung jumlah objek yang muncul =====
function jumlahObjek() {
  const elapsed = (Date.now() - waktuMulai) / 1000;

  // Setelah 15 detik, muncul 2 objek sekaligus
  return elapsed >= 15 ? 2 : 1;
}

// ===== Memunculkan bug dan merpati =====
function munculkan() {
  if (!main) return;

  kosongkan();

  const jumlah = jumlahObjek();

  // Acak posisi tanpa menggunakan kotak yang sama
  const posisi = [];

  while (posisi.length < jumlah) {
    const i = Math.floor(Math.random() * 9);

    if (!posisi.includes(i)) {
      posisi.push(i);
    }
  }

  posisi.forEach(i => {
    const jenis = Math.random() < CHANCE_MERPATI
      ? "merpati"
      : "musuh";

    objekAktif.set(i, jenis);

    kotak[i].textContent = jenis === "musuh"
      ? "👾"
      : "🕊️";

    kotak[i].classList.add("up");
  });
}

// ===== Mengatur kemunculan objek berulang =====
function jadwalkanMuncul() {
  if (!main) return;

  const kecepatan = hitungKecepatan();

  spawnId = setTimeout(() => {
    if (!main) return;

    munculkan();
    jadwalkanMuncul();

  }, kecepatan);
}

// ===== Efek klik =====
function kedip(el, kelas) {
  el.classList.add(kelas);

  setTimeout(() => {
    el.classList.remove(kelas);
  }, 250);
}

// ===== Mengatur combo =====
function resetCombo() {
  combo = 0;

  clearTimeout(comboId);
  comboId = null;
}

function tambahCombo() {
  // Tambah combo setiap berhasil klik bug
  combo++;

  clearTimeout(comboId);

  // Berhasil mencapai 5 combo
  if (combo >= TARGET_COMBO) {

    time += BONUS_WAKTU;

    timeEl.textContent = time;

    combo = 0;

    messageEl.textContent =
      "🔥 COMBO x5! +2 DETIK!";

    return;
  }

  messageEl.textContent =
    "🔥 Combo: " + combo + "/5";

  // Combo hanya berlaku 1,5 detik
  comboId = setTimeout(() => {
    combo = 0;

    comboId = null;

    if (main) {
      messageEl.textContent =
        "Combo habis! Mulai combo lagi.";
    }

  }, BATAS_COMBO);
}

// ===== Sistem klik permainan =====
function tembak(i) {

  if (!main || !objekAktif.has(i)) return;

  const jenis = objekAktif.get(i);

  // Hapus objek yang diklik
  objekAktif.delete(i);

  kotak[i].textContent = "";
  kotak[i].classList.remove("up");

  if (jenis === "musuh") {

    // Bug: +1 poin
    score += 1;

    scoreEl.textContent = score;

    kedip(kotak[i], "hit");

    // Tambah combo
    tambahCombo();

  } else {

    // Merpati: -3 detik
    time -= 3;

    timeEl.textContent = time;

    // Klik merpati menggagalkan combo
    resetCombo();

    kedip(kotak[i], "miss");

    messageEl.textContent =
      "🕊️ Merpati! Waktu -3 detik!";

    // Periksa apakah waktu habis
    if (time <= 0) {
      time = 0;
      timeEl.textContent = time;
      selesai();
    }
  }
}

// ===== Memulai permainan =====
function mulai() {

  if (main) return;

  // Bersihkan timer sebelumnya
  clearInterval(timerId);
  clearTimeout(spawnId);
  clearTimeout(comboId);

  kosongkan();

  score = 0;
  time = DURASI;
  combo = 0;

  main = true;

  waktuMulai = Date.now();

  scoreEl.textContent = score;
  timeEl.textContent = time;

  messageEl.textContent =
    "Tembak 👾 dan hindari 🕊️!";

  startBtn.disabled = true;

  // Munculkan objek pertama
  munculkan();

  // Mulai sistem perpindahan bertahap
  jadwalkanMuncul();

  // Hitung mundur waktu
  timerId = setInterval(() => {

    time--;

    timeEl.textContent = time;

    if (time <= 0) {
      time = 0;
      timeEl.textContent = time;
      selesai();
    }

  }, 1000);
}

// ===== Mengakhiri permainan =====
function selesai() {

  if (!main) return;

  main = false;

  clearInterval(timerId);
  clearTimeout(spawnId);
  clearTimeout(comboId);

  resetCombo();
  kosongkan();

  startBtn.disabled = false;
  startBtn.textContent = "Main Lagi";

  // Periksa rekor terbaik
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
