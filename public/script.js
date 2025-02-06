// Data server Minecraft
const serverData = [
    { ip: "node-1.panelphyzx.my.id", ports: [25565], type: "Java" },
    { ip: "node-1.panelphyzx.my.id", ports: [19132], type: "Bedrock" }
];

// Cek apakah user sudah login
async function isUserLoggedIn() {
    console.log("[DEBUG] Mengecek status login user...");
    try {
        const response = await fetch('http://node-1.panelphyzx.my.id:2015/check-auth');
        const data = await response.json();
        return data.loggedIn;
    } catch (error) {
        console.error("[ERROR] Gagal mengecek login:", error);
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
        alert("Anda harus login terlebih dahulu untuk melihat IP/Port Server.");
        openLoginPopup();
    }
}

// Ambil status server Minecraft
async function fetchMinecraftStatus() {
    console.log("[DEBUG] Memulai pengecekan status server...");

    serverData.forEach(async (server) => {
        try {
            console.log(`[DEBUG] Mengambil status server ${server.type} di ${server.ip}:${server.ports[0]}...`);
            const response = await fetch(`https://api.mcsrvstat.us/2/${server.ip}:${server.ports[0]}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            console.log(`[DEBUG] Data server ${server.type}:`, data);

            const statusElement = document.getElementById("server-status");
            if (!statusElement) {
                console.error("[ERROR] Elemen server-status tidak ditemukan!");
                return;
            }

            statusElement.innerHTML += data.online
                ? `<p>Server ${server.type}: Online | Pemain: ${data.players.online} / ${data.players.max}</p>`
                : `<p>Server ${server.type}: Offline</p>`;

        } catch (error) {
            console.error(`[ERROR] Gagal mengambil status server ${server.type}:`, error);
        }
    });
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
    document.getElementById('login-popup')?.style.display = 'flex';
}
function closeLoginPopup() {
    console.log("[DEBUG] Menutup popup login...");
    document.getElementById('login-popup')?.style.display = 'none';
}

// Login/register dengan backend
async function submitAuth() {
    console.log("[DEBUG] Memulai proses login/register...");
    const gamertag = document.getElementById("gamertag")?.value;
    const password = document.getElementById("password")?.value;

    if (!gamertag || !password) {
        console.warn("[WARNING] GamerTag atau Password belum diisi.");
        return alert("Mohon isi GamerTag dan Password!");
    }

    const isLoginMode = document.getElementById("popup-title")?.innerText === "Login";

    try {
        const endpoint = isLoginMode ? '/login' : '/register';
        const response = await fetch(`http://node-1.panelphyzx.my.id:2015${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gamertag, password }),
        });
        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            closeLoginPopup();
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error("[ERROR] Autentikasi gagal:", error);
        alert("Terjadi kesalahan: " + error.message);
    }
}

// Countdown event
const eventDate = new Date("2025-02-02T15:00:00+07:00");

function updateCountdown() {
    const countdownElement = document.getElementById("countdown");
    if (!countdownElement) return console.error("[ERROR] Elemen countdown tidak ditemukan!");

    const now = new Date();
    const timeLeft = eventDate - now;

    if (timeLeft <= 0) {
        console.log("[DEBUG] Event telah dimulai.");
        document.getElementById("event-info").textContent = "⏳ Event telah dimulai! Selamat bermain!";
        countdownElement.textContent = "00:00:00";
        document.getElementById("register-btn")?.style.display = "none";
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
document.getElementById('server-info-btn')?.addEventListener('click', checkAuthBeforeShowServerInfo);

console.log("[DEBUG] Script selesai dimuat.");
