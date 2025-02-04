// Tambahkan Supabase Library jika belum ada
if (typeof createClient === 'undefined') {
    document.write('<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"><\/script>');
}

// Inisialisasi Supabase
const supabaseUrl = 'https://iafrlxyoeostvhnoywnv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhZnJseHlvZW9zdHZobm95d252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1MzMwNjAsImV4cCI6MjA1NDEwOTA2MH0.WEdZeif209ew2iEWsGs9Y10529hDFI9BVdFvz_7Yeno'; 
const supabase = createClient(supabaseUrl, supabaseKey);

// Data server Minecraft
const serverData = [
    { ip: "kimnetwork.zapto.org", ports: [20607], type: "Java" },
    { ip: "kimnetwork.zapto.org", ports: [20702], type: "Bedrock" }
];

// Cek apakah user sudah login
async function isUserLoggedIn() {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
        console.error("Error Auth:", error);
        return false;
    }
    return !!data.user;
}

// Tampilkan info server jika user login
async function checkAuthBeforeShowServerInfo() {
    const loggedIn = await isUserLoggedIn();
    if (loggedIn) {
        showServerInfo();
    } else {
        alert("Anda harus login terlebih dahulu untuk melihat IP/Port Server.");
        openLoginPopup();
    }
}

// Ambil status server Minecraft
async function fetchMinecraftStatus() {
    console.log("Memulai pengecekan status server...");
    
    serverData.forEach(async (server) => {
        try {
            const response = await fetch(`https://api.mcsrvstat.us/2/${server.ip}:${server.ports[0]}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            console.log(`Data server ${server.type}:`, data);

            const statusElement = document.getElementById("server-status");
            if (!statusElement) return console.error("Elemen server-status tidak ditemukan!");

            statusElement.innerHTML += data.online
                ? `<p>Server ${server.type}: Online | Pemain: ${data.players.online} / ${data.players.max}</p>`
                : `<p>Server ${server.type}: Offline</p>`;

        } catch (error) {
            console.error(`Gagal mengambil status server ${server.type}:`, error);
        }
    });
}

// Tampilkan informasi server
function showServerInfo() {
    const serverDetailsDiv = document.getElementById("server-details");
    if (!serverDetailsDiv) return console.error("Elemen server-details tidak ditemukan!");

    serverDetailsDiv.innerHTML = serverData.map(server =>
        `<p><strong>IP Server ${server.type}:</strong> ${server.ip}</p>
         <p><strong>Port Server ${server.type}:</strong> ${server.ports.join(', ')}</p>`
    ).join('');
}

// Popup login/register
function openLoginPopup() {
    document.getElementById('login-popup')?.style.display = 'flex';
}
function closeLoginPopup() {
    document.getElementById('login-popup')?.style.display = 'none';
}

// Login/register dengan Supabase
async function submitAuth() {
    const gamertag = document.getElementById("gamertag")?.value;
    const password = document.getElementById("password")?.value;

    if (!gamertag || !password) {
        return alert("Mohon isi GamerTag dan Password!");
    }

    const isLoginMode = document.getElementById("popup-title")?.innerText === "Login";
    const email = `${gamertag}@yourdomain.com`; // Gunakan domain asli, bukan @example.com

    try {
        let data, error;
        if (isLoginMode) {
            ({ data, error } = await supabase.auth.signInWithPassword({ email, password }));
        } else {
            ({ data, error } = await supabase.auth.signUp({ email, password }));
            if (data.user) {
                await supabase.from('users').insert([{ gamer_tag: gamertag, email: data.user.email }]);
            }
        }

        if (error) throw error;
        alert(isLoginMode ? "Login berhasil!" : "Registrasi berhasil!");
        closeLoginPopup();
    } catch (error) {
        alert("Terjadi kesalahan: " + error.message);
    }
}

// Countdown event
const eventDate = new Date("2025-02-02T15:00:00+07:00");

function updateCountdown() {
    const countdownElement = document.getElementById("countdown");
    if (!countdownElement) return;

    const now = new Date();
    const timeLeft = eventDate - now;

    if (timeLeft <= 0) {
        document.getElementById("event-info").textContent = "⏳ Event telah dimulai! Selamat bermain!";
        countdownElement.textContent = "00:00:00";
        const registerBtn = document.getElementById("register-btn");
        if (registerBtn) registerBtn.style.display = "none";
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
