document.addEventListener("DOMContentLoaded", async () => {
    console.log("[DEBUG] Halaman dimuat. Menggunakan Supabase dari script.js...");

    // Menunggu Supabase diinisialisasi jika belum ada
    while (!window.supabase) {
        console.warn("[WARNING] Supabase belum diinisialisasi di script.js. Menunggu...");
        await new Promise(resolve => setTimeout(resolve, 500)); // Tunggu 500ms
    }

    console.log("[DEBUG] Supabase berhasil digunakan:", window.supabase);

    // Cek apakah Supabase bisa diakses
    try {
        const { data, error } = await window.supabase.from("event_registrations").select("*").limit(1);
        if (error) throw error;
        console.log("[DEBUG] Supabase terhubung, data contoh:", data);
    } catch (err) {
        console.error("[ERROR] Gagal menghubungkan ke Supabase:", err);
    }

    // Cek apakah formulir ada sebelum menambahkan event listener
    const form = document.getElementById("event-form");
    if (!form) {
        console.error("[ERROR] Formulir event tidak ditemukan di halaman!");
        return;
    }

    // Event listener untuk form pendaftaran event
    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const gamertag = document.getElementById("gamertag").value.trim();
        const email = document.getElementById("email").value.trim();
        const termsAgreed = document.getElementById("terms").checked;

        console.log("[DEBUG] Data form:", { name, phone, gamertag, email, termsAgreed });

        if (!termsAgreed) {
            console.error("[ERROR] Syarat & ketentuan belum disetujui.");
            document.getElementById("status").textContent = "Anda harus menyetujui syarat & ketentuan!";
            return;
        }

        try {
            // Simpan data ke Supabase
            console.log("[DEBUG] Mengirim data ke Supabase...");
            const { data, error } = await window.supabase.from("event_registrations").insert([
                { name, phone, gamertag, email, terms_agreed: termsAgreed }
            ]);

            if (error) {
                console.error("[ERROR] Gagal menyimpan ke Supabase:", error);
                throw error;
            }

            console.log("[DEBUG] Data berhasil disimpan di Supabase:", data);

            // Kirim email konfirmasi via Resend
            console.log("[DEBUG] Mengirim email konfirmasi ke:", email);
            await sendEmail(name, email);

            document.getElementById("status").textContent = "Pendaftaran berhasil! Cek email Anda.";
            form.reset();
        } catch (err) {
            console.error("[ERROR] Terjadi kesalahan:", err);
            document.getElementById("status").textContent = "Terjadi kesalahan: " + err.message;
        }
    });
});

    // Fungsi untuk mengirim email via Resend
    async function sendEmail(name, email) {
        const eventName = "Event KimNetwork";
        const resendApiKey = "re_cnfCgBHC_DFZhhpdRx5iaxVUanuPomiLS"; // Pastikan sudah didefinisikan

        try {
            const response = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${resendApiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    from: "KimNetwork <noreply@onresend.com>",
                    to: [email],
                    subject: `Pendaftaran Berhasil: ${eventName}`,
                    html: `<p>Halo ${name},</p>
                           <p>Terima kasih telah mendaftar di <b>${eventName}</b>!</p>
                           <p>Pastikan Anda mengikuti informasi terbaru di server kami.</p>
                           <br>
                           <p>Salam,</p>
                           <p><b>Tim KimNetwork</b></p>`
                })
            });

            const result = await response.json();
            if (!response.ok) {
                console.error("[ERROR] Gagal mengirim email:", result);
                throw new Error("Gagal mengirim email konfirmasi.");
            }

            console.log("[DEBUG] Email berhasil dikirim:", result);
        } catch (err) {
            console.error("[ERROR] Terjadi kesalahan saat mengirim email:", err);
        }
    }
