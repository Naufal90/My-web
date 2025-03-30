// Log pertama saat file music.js berhasil dimuat
console.log("[INFO] music.js berhasil dimuat.");

// Ambil elemen-elemen musik setelah DOM dimuat
document.addEventListener("DOMContentLoaded", function() {
    console.log("[INFO] DOM selesai dimuat, inisialisasi musik...");

    let music = document.getElementById("bg-music");
    let musicPanel = document.getElementById("music-panel");
    let musicIcon = document.getElementById("music-icon");
    let toggleMusicBtn = document.getElementById("toggle-music");
    let stopMusicBtn = document.getElementById("stop-music");

    // Cek apakah semua elemen ditemukan
    if (!music) console.error("[ERROR] Elemen #bg-music tidak ditemukan!");
if (!musicPanel) console.error("[ERROR] Elemen #music-panel tidak ditemukan!");
if (!musicIcon) console.error("[ERROR] Elemen #music-icon tidak ditemukan!");
if (!toggleMusicBtn) console.error("[ERROR] Elemen #toggle-music tidak ditemukan!");
if (!stopMusicBtn) console.error("[ERROR] Elemen #stop-music tidak ditemukan!");

if (!music || !musicPanel || !musicIcon || !toggleMusicBtn || !stopMusicBtn) {
    console.error("[ERROR] Beberapa elemen musik tidak ditemukan! Periksa HTML Anda.");
    return;
}

    // Coba autoplay saat halaman dimuat
    let playPromise = music.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.warn("[WARNING] Autoplay diblokir, menunggu interaksi pengguna.");
        });
    }

    // Pastikan musik mulai setelah interaksi pertama jika autoplay diblokir
    document.addEventListener("click", function playOnce() {
        if (music.paused) {
            music.play().then(() => {
                console.log("[INFO] Musik diputar setelah interaksi pengguna.");
            }).catch(err => {
                console.error("[ERROR] Gagal memutar musik: ", err);
            });
        }
        document.removeEventListener("click", playOnce);
    });

    function togglePanel() {
        musicPanel.style.display = (musicPanel.style.display === "none" || musicPanel.style.display === "") ? "block" : "none";
        console.log("[DEBUG] Panel musik " + (musicPanel.style.display === "block" ? "dibuka" : "ditutup"));
    }

    function toggleMusic() {
        if (music.paused) {
            music.play();
            console.log("[INFO] Musik diputar.");
        } else {
            music.pause();
            console.log("[INFO] Musik dijeda.");
        }
    }

    function stopMusic() {
        music.pause();
        music.currentTime = 0; // Reset ke awal
        console.log("[INFO] Musik dihentikan dan di-reset ke awal.");
    }

    // Event listener
    musicIcon.addEventListener("click", togglePanel);
    toggleMusicBtn.addEventListener("click", toggleMusic);
    stopMusicBtn.addEventListener("click", stopMusic);

    // Pastikan ikon musik muncul saat halaman dimuat
    musicPanel.style.display = "none";
    musicIcon.style.display = "block";

    console.log("[DEBUG] Musik berhasil diinisialisasi!");
});