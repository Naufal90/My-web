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
        const response = await fetch('http://node-1.panelphyzx.my.id:2015/check-auth');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return data.loggedIn;
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
    //const submitButton = document.querySelector(".btn"); // Tombol Submit
    const toggleAuthText = document.getElementById("toggle-auth");

    // Cek mode saat ini
    const isLoginMode = popupTitle.innerText === "Login";

    // Toggle antara mode Login dan Register
    if (isLoginMode) {
        popupTitle.innerText = "Register"; // Ubah judul ke "Register"
        //submitButton.innerText = "Register"; // Ubah teks tombol ke "Register"
        toggleAuthText.innerHTML = 'Sudah punya akun? <a href="#" onclick="toggleAuthMode()">Login di sini</a>';
    } else {
        popupTitle.innerText = "Login"; // Ubah judul ke "Login"
        //submitButton.innerText = "Login"; // Ubah teks tombol ke "Login"
        toggleAuthText.innerHTML = 'Belum punya akun? <a href="#" onclick="toggleAuthMode()">Register di sini</a>';
    }
}

// Login/register dengan backend
async function submitAuth() {
    console.log("[DEBUG] Memulai proses login/register...");
    const gamertag = document.getElementById("gamertag")?.value;
    const password = document.getElementById("password")?.value;

    if (!gamertag || !password) {
        console.warn("[WARNING] GamerTag atau Password belum diisi.");
        showError("Mohon isi GamerTag dan Password!");
        return;
    }

    const isLoginMode = document.getElementById("popup-title")?.innerText === "Login";

    try {
        const endpoint = isLoginMode ? '/login' : '/register';
        const url = `http://node-1.panelphyzx.my.id:2015${endpoint}`;
        const body = JSON.stringify({ gamertag, password });

        console.log("[DEBUG] Mengirim request ke:", url);
        console.log("[DEBUG] Data yang dikirim:", body);

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body,
        });

        console.log("[DEBUG] Respons dari backend:", response);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("[DEBUG] Data dari backend:", data);

        if (response.ok) {
            alert(data.message);
            closeLoginPopup();
        } else {
            showError(data.error);
        }
    } catch (error) {
        console.error("[ERROR] Autentikasi gagal:", error);
        showError("Terjadi kesalahan: " + error.message);
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
