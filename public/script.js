// Konfigurasi Supabase
const supabaseUrl = 'https://iafrlxyoeostvhnoywnv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhZnJseHlvZW9zdHZobm95d252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1MzMwNjAsImV4cCI6MjA1NDEwOTA2MH0.WEdZeif209ew2iEWsGs9Y10529hDFI9BVdFvz_7Yeno';
const supabase = createClient(supabaseUrl, supabaseKey);

// Server data dengan IP dan port
const serverData = [
    { ip: "kimnetwork.zapto.org", ports: [20607], type: "Java" },
    { ip: "kimnetwork.zapto.org", ports: [20702], type: "Bedrock" }
];

// Fungsi untuk memeriksa apakah pengguna sudah login
function isUserLoggedIn() {
    const user = supabase.auth.user();
    return !!user; // Kembalikan true jika pengguna sudah login
}

// Fungsi untuk memeriksa autentikasi sebelum menampilkan IP/Port Server
function checkAuthBeforeShowServerInfo() {
    if (isUserLoggedIn()) {
        // Jika pengguna sudah login, tampilkan IP/Port Server
        showServerInfo();
    } else {
        // Jika pengguna belum login, tampilkan peringatan dan popup login/register
        alert("Anda harus login terlebih dahulu untuk melihat IP/Port Server.");
        openLoginPopup(); // Buka popup Login/Register
    }
}

// Fungsi untuk mendapatkan status server Minecraft
async function fetchMinecraftStatus() {
    const activeServer = serverData[0]; // Gunakan server pertama untuk memeriksa status

    try {
        const response = await fetch(`https://api.mcsrvstat.us/2/${activeServer.ip}:${activeServer.ports[0]}`);
        if (response.ok) {
            const data = await response.json();

            if (data.online) {
                document.getElementById("server-status").textContent = 
                    `Server Online: Ya | Pemain Aktif: ${data.players.online} / ${data.players.max}`;
                
                // Daftar pemain online
                const playerList = document.getElementById("player-list");
                if (data.players.list && data.players.list.length > 0) {
                    playerList.innerHTML = "";
                    data.players.list.forEach(player => {
                        const playerItem = document.createElement("li");
                        playerItem.textContent = player;
                        playerList.appendChild(playerItem);
                    });
                } else {
                    document.getElementById("players-status").textContent = "Tidak ada pemain yang online saat ini.";
                }
            } else {
                document.getElementById("server-status").textContent = "Server sedang offline.";
                document.getElementById("players-status").textContent = "Tidak ada data pemain.";
            }
        } else {
            document.getElementById("server-status").textContent = "Gagal memuat status server.";
        }
    } catch (error) {
        document.getElementById("server-status").textContent = "Terjadi kesalahan: " + error.message;
    }
}

// Fungsi untuk menampilkan IP dan port server
function showServerInfo() {
    const serverDetailsDiv = document.getElementById("server-details");
    let detailsHTML = '';
    serverData.forEach((server, index) => {
        detailsHTML += `
            <p><strong>IP Server ${server.type}:</strong> ${server.ip}</p>
            <p><strong>Port Server ${server.type}:</strong> ${server.ports.join(', ')}</p>
        `;
    });
    serverDetailsDiv.innerHTML = detailsHTML;
}

// Fungsi untuk membuka popup Login/Register
function openLoginPopup() {
    const popup = document.getElementById('login-popup');
    popup.style.display = 'flex'; // Menampilkan popup
}

// Fungsi untuk menutup popup Login/Register
function closeLoginPopup() {
    const popup = document.getElementById('login-popup');
    popup.style.display = 'none'; // Menyembunyikan popup
}

// Fungsi untuk toggle antara mode Login dan Register
function toggleAuthMode() {
    const popupTitle = document.getElementById('popup-title');
    const toggleAuthText = document.getElementById('toggle-auth');

    if (popupTitle.innerText === 'Login') {
        popupTitle.innerText = 'Register';
        toggleAuthText.innerText = 'Sudah punya akun? Login';
    } else {
        popupTitle.innerText = 'Login';
        toggleAuthText.innerText = 'Belum punya akun? Register';
    }
}

// Fungsi untuk menangani login/register
async function submitAuth() {
    const gamertag = document.getElementById("gamertag").value;
    const password = document.getElementById("password").value;

    if (!gamertag || !password) {
        alert("Mohon isi GamerTag dan Password!");
        return;
    }

    const isLoginMode = document.getElementById("popup-title").innerText === "Login";

    try {
        if (isLoginMode) {
            // Login
            const { user, error } = await supabase.auth.signInWithPassword({
                email: `${gamertag}@example.com`,
                password: password,
            });

            if (error) throw error;
            alert("Login berhasil!");

            // Aktifkan tombol "Lihat IP/Port Server"
            const serverInfoBtn = document.getElementById('server-info-btn');
            if (serverInfoBtn) serverInfoBtn.disabled = false;
        } else {
            // Register
            const { user, error } = await supabase.auth.signUp({
                email: `${gamertag}@example.com`,
                password: password,
            });

            if (error) throw error;

            // Simpan data gamer ke database
            const { data, error: dbError } = await supabase
                .from('users')
                .insert([{ gamer_tag: gamertag, email: user.email }]);

            if (dbError) throw dbError;
            alert("Registrasi berhasil!");

            // Aktifkan tombol "Lihat IP/Port Server"
            const serverInfoBtn = document.getElementById('server-info-btn');
            if (serverInfoBtn) serverInfoBtn.disabled = false;
        }

        closeLoginPopup();
    } catch (error) {
        alert("Terjadi kesalahan: " + error.message);
    }
}

// Countdown event
const eventDate = new Date("2025-02-02T15:00:00+07:00"); // 15:00 WIB (UTC+7)

function updateCountdown() {
    const now = new Date();
    const timeLeft = eventDate - now;

    if (timeLeft <= 0) {
        document.getElementById("event-info").textContent = "⏳ Event telah dimulai! Selamat bermain!";
        document.getElementById("countdown").textContent = "00:00:00";
        document.getElementById("register-btn").style.display = "none"; // Sembunyikan tombol jika event mulai
    } else {
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        document.getElementById("countdown").textContent = `${days} hari ${hours} jam ${minutes} menit ${seconds} detik`;
    }
}

// Jalankan countdown setiap detik
setInterval(updateCountdown, 1000);
updateCountdown();

// Memuat status server saat halaman dibuka
window.addEventListener('load', () => {
    fetchMinecraftStatus(); // Cek status server di awal
});

// Event listener untuk tombol "Tampilkan IP & Port Server"
document.getElementById('server-info-btn').addEventListener('click', checkAuthBeforeShowServerInfo);

// Event listener untuk tombol Submit di popup
document.querySelector('.popup-content button').addEventListener('click', submitAuth);
