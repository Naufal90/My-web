document.addEventListener("DOMContentLoaded", async () => {
    console.log("[DEBUG] Halaman dimuat. Menggunakan Supabase dari supabase.js...");

    // Menunggu Supabase diinisialisasi jika belum ada
    while (!window.supabase) {
        console.warn("[WARNING] Supabase belum diinisialisasi di supabase.js. Menunggu...");
        await new Promise(resolve => setTimeout(resolve, 500)); // Tunggu 500ms
    }

    console.log("[DEBUG] Supabase berhasil digunakan");

    // Cek apakah Supabase bisa diakses
    try {
        const { data, error } = await window.supabase.from("event_registrations").select("*").limit(1);
        if (error) throw error;
        console.log("[DEBUG] Supabase terhubung, data contoh");
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
    
