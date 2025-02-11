// Inisialisasi Supabase Client
const SUPABASE_URL = "https://iafrlxyoeostvhnoywnv.supabase.co"; // Ganti dengan URL Supabase kamu
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhZnJseHlvZW9zdHZobm95d252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1MzMwNjAsImV4cCI6MjA1NDEwOTA2MH0.WEdZeif209ew2iEWsGs9Y10529hDFI9BVdFvz_7Yeno"; // Ganti dengan API Key Supabase kamu

document.addEventListener("DOMContentLoaded", async () => {
    window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("[DEBUG] Supabase berhasil diinisialisasi:", window.supabase);
    await updateHeader(); // Perbarui header saat halaman dimuat
});

// Fungsi untuk memperbarui header berdasarkan status login
async function updateHeader() {
    const authButtons = document.getElementById("auth-buttons");
    const userInfo = document.getElementById("user-info");
    const userEmail = document.getElementById("user-email");

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
    { ip: "node-1.panelphyzx.my.id", ports: [25565], type: "Java" },
    { ip: "node-1.panelphyzx.my.id", ports: [19132], type: "Bedrock" }
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
                statusElement.innerHTML += data.online
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

    // Cek mode saat ini
    const isLoginMode = popupTitle.innerText === "Login";

    // Toggle antara mode Login dan Register
    if (isLoginMode) {
        popupTitle.innerText = "Register"; // Ubah judul ke "Register"
        toggleAuthText.innerHTML = 'Sudah punya akun? <a href="#" onclick="toggleAuthMode()">Login di sini</a>';
    } else {
        popupTitle.innerText = "Login"; // Ubah judul ke "Login"
        toggleAuthText.innerHTML = 'Belum punya akun? <a href="#" onclick="toggleAuthMode()">Register di sini</a>';
    }
}

// Login/register dengan Supabase
async function submitAuth() {
    console.log("[DEBUG] Memulai proses login/register...");
    const email = document.getElementById("email")?.value;
    const password = document.getElementById("password")?.value;

    if (!email || !password) {
        console.warn("[WARNING] Email atau Password belum diisi.");
        showError("Mohon isi Email dan Password!");
        return;
    }

    const isLoginMode = document.getElementById("popup-title")?.innerText === "Login";

    try {
        let response;
        if (isLoginMode) {
            response = await supabase.auth.signInWithPassword({ email, password });
        } else {
            response = await supabase.auth.signUp({ email, password });
        }

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

console.log("[DEBUG] Script selesai dimuat.");
