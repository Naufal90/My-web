const supabaseUrl = 'https://iafrlxyoeostvhnoywnv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhZnJseHlvZW9zdHZobm95d252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1MzMwNjAsImV4cCI6MjA1NDEwOTA2MH0.WEdZeif209ew2iEWsGs9Y10529hDFI9BVdFvz_7Yeno'; // Kunci disembunyikan demi keamanan
const supabase = createClient(supabaseUrl, supabaseKey);

// Server data dengan IP dan port
const serverData = [
    { ip: "kimnetwork.zapto.org", ports: [20607], type: "Java" },
    { ip: "kimnetwork.zapto.org", ports: [20702], type: "Bedrock" }
];

// Fungsi untuk memeriksa apakah pengguna sudah login
async function isUserLoggedIn() {
    const { data, error } = await supabase.auth.getUser();
    return data?.user !== null; // Pastikan data aman
}

// Fungsi untuk menampilkan informasi server jika pengguna sudah login
async function checkAuthBeforeShowServerInfo() {
    const loggedIn = await isUserLoggedIn();
    if (loggedIn) {
        showServerInfo();
    } else {
        alert("Anda harus login terlebih dahulu untuk melihat IP/Port Server.");
        openLoginPopup();
    }
}

// Fungsi untuk mendapatkan status server Minecraft (Java & Bedrock)
async function fetchMinecraftStatus() {
    serverData.forEach(async (server) => {
        try {
            const response = await fetch(`https://api.mcsrvstat.us/2/${server.ip}:${server.ports[0]}`);
            if (response.ok) {
                const data = await response.json();
                const statusElement = document.getElementById("server-status");
                const playerListElement = document.getElementById("player-list");
                const playersStatusElement = document.getElementById("players-status");

                if (data.online) {
                    statusElement.innerHTML += `<p>Server ${server.type}: Online | Pemain: ${data.players.online} / ${data.players.max}</p>`;

                    if (data.players.list && data.players.list.length > 0) {
                        playerListElement.innerHTML = "";
                        data.players.list.forEach(player => {
                            const playerItem = document.createElement("li");
                            playerItem.textContent = player;
                            playerListElement.appendChild(playerItem);
                        });
                    } else {
                        playersStatusElement.innerHTML = `<p>Server ${server.type}: Tidak ada pemain online.</p>`;
                    }
                } else {
                    statusElement.innerHTML += `<p>Server ${server.type}: Offline</p>`;
                }
            } else {
                document.getElementById("server-status").innerHTML += `<p>Server ${server.type}: Gagal memuat status</p>`;
            }
        } catch (error) {
            document.getElementById("server-status").innerHTML += `<p>Server ${server.type}: Terjadi kesalahan (${error.message})</p>`;
        }
    });
}

// Fungsi untuk menampilkan IP dan port server
function showServerInfo() {
    const serverDetailsDiv = document.getElementById("server-details");
    if (!serverDetailsDiv) return;

    let detailsHTML = '';
    serverData.forEach(server => {
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
    if (popup) popup.style.display = 'flex';
}

// Fungsi untuk menutup popup Login/Register
function closeLoginPopup() {
    const popup = document.getElementById('login-popup');
    if (popup) popup.style.display = 'none';
}

// Fungsi login/register dengan Supabase
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
            const { data, error } = await supabase.auth.signInWithPassword({
                email: `${gamertag}@example.com`,
                password: password,
            });

            if (error) throw error;
            alert("Login berhasil!");
        } else {
            const { data, error } = await supabase.auth.signUp({
                email: `${gamertag}@example.com`,
                password: password,
            });

            if (error) throw error;

            if (data.user) {
                await supabase.from('users').insert([{ gamer_tag: gamertag, email: data.user.email }]);
            }

            alert("Registrasi berhasil!");
        }

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
