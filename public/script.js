// Server data dengan IP dan port hanya untuk Bedrock
const serverData = [
    { ip: "kimnetwork.mcsh.io", ports: [10255], type: "Java" },
    { ip: "kimnetwork.zapto.org", ports: [20702], type: "Bedrock" }
];

// Fungsi untuk mendapatkan status server Minecraft
async function fetchMinecraftStatus() {
    const activeServer = serverData[0]; // Gunakan server Bedrock untuk memeriksa status (server[0])

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

// Fungsi untuk menampilkan IP dan port server (Java dan Bedrock)
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
    fetchMinecraftStatus(); // Cek status server Bedrock di awal
});
