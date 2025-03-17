// Inisialisasi Supabase Client
const SUPABASE_URL = "https://iafrlxyoeostvhnoywnv.supabase.co"; // Ganti dengan URL Supabase kamu
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhZnJseHlvZW9zdHZobm95d252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1MzMwNjAsImV4cCI6MjA1NDEwOTA2MH0.WEdZeif209ew2iEWsGs9Y10529hDFI9BVdFvz_7Yeno"; // Ganti dengan API Key Supabase kamu

document.addEventListener("DOMContentLoaded", async () => {
    // 🔹 Inisialisasi Supabase
    window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("[DEBUG] Supabase berhasil diinisialisasi:", window.supabase);
    await updateHeader(); // Perbarui header saat halaman dimuat

    // 🔹 Inisialisasi Musik
    let music = document.getElementById("bg-music");

    // Coba autoplay saat halaman dimuat
    let playPromise = music.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.log("Autoplay diblokir, menunggu interaksi pengguna.");
        });
    }

    // Pastikan musik mulai setelah interaksi pertama jika autoplay diblokir
    document.addEventListener("click", function () {
        if (music.paused) {
            music.play();
        }
    }, { once: true });

    function togglePanel() {
        let panel = document.getElementById("music-panel");
        panel.style.display = (panel.style.display === "none" || panel.style.display === "") ? "block" : "none";
    }

    function toggleMusic() {
        if (music.paused) {
            music.play();
        } else {
            music.pause();
        }
    }

    function stopMusic() {
        music.pause();
        music.currentTime = 0; // Reset ke awal
    }

    // 🔹 Event listener untuk tombol musik
    document.getElementById("music-icon").addEventListener("click", togglePanel);
    document.getElementById("toggle-music").addEventListener("click", toggleMusic);
    document.getElementById("stop-music").addEventListener("click", stopMusic);

    // 🔹 Pastikan ikon musik muncul saat halaman dimuat
    document.getElementById("music-panel").style.display = "none";
    document.getElementById("music-icon").style.display = "block";
});

// Fungsi untuk memperbarui header berdasarkan status login
async function updateHeader() {
    const authButtons = document.getElementById("auth-buttons");
    const userInfo = document.getElementById("user-info");
    const userEmail = document.getElementById("user-email");

    // Pastikan elemen ada sebelum mengakses properti style
    if (!authButtons || !userInfo || !userEmail) {
        console.error("[ERROR] Elemen header tidak ditemukan!");
        return;
    }

    // Cek status login
    const { data, error } = await supabase.auth.getSession();

    if (data.session) {
        // Jika pengguna sudah login
        authButtons.style.display = "none"; // Sembunyikan tombol login/register
        userInfo.style.display = "flex"; // Tampilkan info pengguna dan tombol logout
        userEmail.textContent = data.session.user.email; // Tampilkan email pengguna
    } else {
        // Jika pengguna belum login
        authButtons.style.display = "block"; // Tampilkan tombol login/register
        userInfo.style.display = "none"; // Sembunyikan info pengguna dan tombol logout
    }
}

// Data server Minecraft
const serverData = [
    { ip: "kimnetwork.play.hosting", ports: [28077], type: "Java" },
    { ip: "kimnetwork.play.hosting", ports: [28601], type: "Bedrock" }
];

// Utility function untuk menampilkan pesan error
function showError(message) {
    const errorElement = document.getElementById("error-message");
    if (errorElement) {
        errorElement.textContent = message;
    } else {
        console.error("[ERROR] Elemen error-message tidak ditemukan!");
    }
}

// Cek apakah user sudah login
async function isUserLoggedIn() {
    console.log("[DEBUG] Mengecek status login user...");
    try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        return !!data.user;
    } catch (error) {
        console.error("[ERROR] Gagal mengecek login:", error);
        showError("Gagal mengecek status login. Silakan coba lagi.");
        return false;
    }
}

// Tampilkan info server jika user login
async function checkAuthBeforeShowServerInfo() {
    console.log("[DEBUG] Memeriksa otentikasi sebelum menampilkan info server...");
    const loggedIn = await isUserLoggedIn();
    if (loggedIn) {
        console.log("[DEBUG] User terautentikasi, menampilkan info server.");
        showServerInfo();
    } else {
        console.warn("[WARNING] User belum login, menampilkan popup login.");
        showError("Anda harus login terlebih dahulu untuk melihat IP/Port Server.");
        openLoginPopup();
    }
}

// Ambil status server Minecraft
async function fetchMinecraftStatus() {
    console.log("[DEBUG] Memulai pengecekan status server...");

    for (const server of serverData) {
        // Cek jika server adalah versi Java
        if (server.type === "Java") {
            try {
                console.log(`[DEBUG] Mengambil status server ${server.type} di ${server.ip}:${server.ports[0]}...`);
                const response = await fetch(`https://api.mcsrvstat.us/2/${server.ip}:${server.ports[0]}`);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                const data = await response.json();
                console.log(`[DEBUG] Data server ${server.type}:`, data);

                const statusElement = document.getElementById("server-status");
                const playersStatusElement = document.getElementById("players-status"); // Elemen untuk daftar pemain

                if (!statusElement || !playersStatusElement) {
                    console.error("[ERROR] Elemen server-status atau players-status tidak ditemukan!");
                    return;
                }

                // Tampilkan status server
                statusElement.innerHTML = data.online
                    ? `<p>Server : Online | Pemain: ${data.players.online} / ${data.players.max}</p>`
                    : `<p>Server : Offline</p>`;

                // Tampilkan daftar pemain jika server online
                if (data.online && data.players.list) {
                    playersStatusElement.innerHTML = `
                        <h3>Pemain Online:</h3>
                        <ul>
                            ${data.players.list.map(player => `<li>${player}</li>`).join('')}
                        </ul>
                    `;
                } else {
                    playersStatusElement.innerHTML = `<p>Tidak ada pemain online.</p>`;
                }

            } catch (error) {
                console.error(`[ERROR] Gagal mengambil status server ${server.type}:`, error);
                showError(`Gagal mengambil status server ${server.type}. Silakan coba lagi.`);
            }
        } else {
            console.log(`[DEBUG] Server ${server.type} diabaikan karena bukan versi Java.`);
        }
    }
}

// Tampilkan informasi server
function showServerInfo() {
    console.log("[DEBUG] Menampilkan informasi server...");
    const serverDetailsDiv = document.getElementById("server-details");
    if (!serverDetailsDiv) {
        console.error("[ERROR] Elemen server-details tidak ditemukan!");
        return;
    }

    serverDetailsDiv.innerHTML = serverData.map(server =>
        `<p><strong>IP Server ${server.type}:</strong> ${server.ip}</p>
         <p><strong>Port Server ${server.type}:</strong> ${server.ports.join(', ')}</p>`
    ).join('');
}

// Popup login/register
function openLoginPopup() {
    console.log("[DEBUG] Membuka popup login...");
    const loginPopupElement = document.getElementById('login-popup');
    if (!loginPopupElement) {
        console.error("[ERROR] Elemen login-popup tidak ditemukan!");
        return;
    }
    loginPopupElement.style.display = 'flex';
}

function closeLoginPopup() {
    console.log("[DEBUG] Menutup popup login...");
    const loginPopupElement = document.getElementById('login-popup');
    if (!loginPopupElement) {
        console.error("[ERROR] Elemen login-popup tidak ditemukan!");
        return;
    }
    loginPopupElement.style.display = 'none';
}

// Toggle antara mode Login dan Register
function toggleAuthMode() {
    const popupTitle = document.getElementById("popup-title");
    const toggleAuthText = document.getElementById("toggle-auth");
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    // Cek mode saat ini berdasarkan teks judul
    const isLoginMode = popupTitle.innerText === "Login";

    if (isLoginMode) {
        popupTitle.innerText = "Register"; 
        toggleAuthText.innerHTML = 'Sudah punya akun? <a href="#" onclick="toggleAuthMode()">Login di sini</a>';
        loginForm.style.display = "none";  
        registerForm.style.display = "block";  
    } else {
        popupTitle.innerText = "Login"; 
        toggleAuthText.innerHTML = 'Belum punya akun? <a href="#" onclick="toggleAuthMode()">Register di sini</a>';
        loginForm.style.display = "block";  
        registerForm.style.display = "none";  
    }
}

// Login/register dengan Supabase
async function submitAuth() {
    console.log("[DEBUG] Memulai proses login/register...");

    const isLoginMode = document.getElementById("popup-title")?.innerText === "Login";
    const email = document.getElementById(isLoginMode ? "login-email" : "register-email")?.value;
    const password = document.getElementById(isLoginMode ? "login-password" : "register-password")?.value;

    console.log("[DEBUG] isLoginMode:", isLoginMode);
    console.log("[DEBUG] Email:", email);
    console.log("[DEBUG] Password:", password);

    if (!email || !password) {
        console.warn("[WARNING] Email atau Password belum diisi.");
        showError("Mohon isi Email dan Password!");
        return;
    }

    try {
        let response;
        if (isLoginMode) {
            response = await supabase.auth.signInWithPassword({ email, password });
        } else {
            response = await supabase.auth.signUp({ email, password });
        }

        console.log("[DEBUG] Respons dari Supabase:", response);

        if (response.error) {
            throw response.error;
        }

        alert(isLoginMode ? "Login berhasil!" : "Registrasi berhasil! Silakan cek email Anda untuk verifikasi.");
        closeLoginPopup();
        await updateHeader(); // Perbarui header setelah login/register
    } catch (error) {
        console.error("[ERROR] Autentikasi gagal:", error);
        showError("Terjadi kesalahan: " + error.message);
    }
}
// Logout dengan Supabase
async function logout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        alert("Logout berhasil!");
        await updateHeader(); // Perbarui header setelah logout
    } catch (error) {
        console.error("[ERROR] Logout gagal:", error);
        showError("Terjadi kesalahan saat logout.");
    }
}

// Login dengan Google
async function loginWithGoogle() {
    console.log("[DEBUG] Memulai login dengan Google...");

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: window.location.origin // Redirect kembali ke situs setelah login
        }
    });

    if (error) {
        console.error("[ERROR] Gagal login dengan Google:", error);
        showError("Gagal login dengan Google. Silakan coba lagi.");
    } else {
        console.log("[DEBUG] Login Google berhasil:", data);
        alert("Login dengan Google berhasil!");
        await updateHeader();
    }
}

// Login dengan WhatsApp (Menggunakan Deep Link)
//function loginWithWhatsApp() {
    //console.log("[DEBUG] Memulai login dengan WhatsApp...");

    // Gantilah nomor admin dengan nomor yang digunakan untuk verifikasi
 //   const adminPhoneNumber = "6281234567890"; // Ganti dengan nomor admin WhatsApp
   // const loginMessage = encodeURIComponent("Halo, saya ingin login ke website!");

    // Membuka WhatsApp dengan pesan otomatis
    //const whatsappURL = `https://wa.me/${adminPhoneNumber}?text=${loginMessage}`;
   // window.open(whatsappURL, "_blank");

    //alert("Silakan kirim pesan WhatsApp untuk mendapatkan kode verifikasi.");
//}

// Tambahkan event listener untuk tombol login
document.getElementById("google-login-btn")?.addEventListener("click", loginWithGoogle);
//document.getElementById("whatsapp-login-btn")?.addEventListener("click", loginWithWhatsApp);

// Countdown event
const eventDate = new Date("2025-02-02T15:00:00+07:00");

function updateCountdown() {
    const countdownElement = document.getElementById("countdown");
    const eventInfoElement = document.getElementById("event-info");
    const registerBtnElement = document.getElementById("register-btn");

    if (!countdownElement || !eventInfoElement || !registerBtnElement) {
        return console.error("[ERROR] Elemen countdown, event-info, atau register-btn tidak ditemukan!");
    }

    const now = new Date();
    const timeLeft = eventDate - now;

    if (timeLeft <= 0) {
        console.log("[DEBUG] Event telah dimulai.");
        eventInfoElement.textContent = "⏳ Event telah dimulai! Selamat bermain!";
        countdownElement.textContent = "00:00:00";
        registerBtnElement.style.display = "none";
    } else {
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        countdownElement.textContent = `${days} hari ${hours} jam ${minutes} menit ${seconds} detik`;
    }
}

// Jalankan countdown setiap detik
setInterval(updateCountdown, 1000);
updateCountdown();

// Memuat status server saat halaman dibuka
window.addEventListener('load', fetchMinecraftStatus);

// Event listener untuk tombol "Tampilkan IP & Port Server"
const serverInfoBtn = document.getElementById('server-info-btn');
if (!serverInfoBtn) {
    console.error("[ERROR] Elemen server-info-btn tidak ditemukan!");
} else {
    serverInfoBtn.addEventListener('click', checkAuthBeforeShowServerInfo);
}

// Fungsi untuk menampilkan redeem code
async function showRedeemCode() {
    const redeemMessage = document.getElementById("redeem-message");
    const redeemDetails = document.getElementById("redeem-details");
    const redeemCodeValue = document.getElementById("redeem-code-value");

    // Cek status login
    const { data, error } = await supabase.auth.getSession();

    if (data.session) {
        // Jika pengguna sudah login
        redeemMessage.textContent = "Redeem code berhasil dimuat!";
        redeemDetails.style.display = "block";

        // Contoh redeem code (bisa diganti dengan data dari database)
        const redeemCode = "EXPBOOST5000";
        redeemCodeValue.textContent = redeemCode;
    } else {
        // Jika pengguna belum login
        redeemMessage.textContent = "Silakan login terlebih dahulu untuk melihat redeem code.";
        redeemDetails.style.display = "none";
        openLoginPopup(); // Buka popup login
    }
}

console.log("[DEBUG] Script selesai dimuat.");
