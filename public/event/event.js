document.addEventListener("DOMContentLoaded", async () => {
    console.log("[DEBUG] Halaman dimuat. Menggunakan Supabase dari supabase.js...");

    // Konfigurasi EmailJS
    const EMAILJS_CONFIG = {
        SERVICE_ID: "service_8h7daa7",
        TEMPLATE_ID: "template_p4sylrw"
    };
    
    async function waitForEmailJS(maxRetries = 10, interval = 300) {
        let retries = 0;
        
        while (retries < maxRetries) {
            if (window.emailjs && window.emailjs.init) {
                console.log("[DEBUG] EmailJS siap digunakan");
                return true;
            }
            
            console.warn(`[WAIT] Menunggu EmailJS... (Percobaan ${retries + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, interval));
            retries++;
        }
        
        throw new Error("EmailJS gagal diinisialisasi setelah beberapa percobaan");
    }

    // Fungsi untuk mengirim email
    async function sendEmail(name, email, platform) {
        try {
            const response = await emailjs.send(
                EMAILJS_CONFIG.SERVICE_ID,
                EMAILJS_CONFIG.TEMPLATE_ID,
                {
                    to_name: name,
                    email: email,
                    event_name: "Building Part 1 KimNetwork",
                    platform: platform,
                    message: `Terima kasih telah mendaftar di Event building Part 1 KimNetwork!)`
                }
            );
            console.log("[DEBUG] Email berhasil dikirim:", response);
            return response;
        } catch (error) {
            console.error("[ERROR] Gagal mengirim email:", error);
            throw error;
        }
    }
    
    try {
        // Tunggu EmailJS siap pertama kali
        await waitForEmailJS();

        // Menunggu Supabase diinisialisasi
        while (!window.supabase) {
            console.warn("[WARNING] Supabase belum diinisialisasi. Menunggu...");
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Cek koneksi Supabase
        try {
            const { data, error } = await window.supabase.from("event_registrations").select("*").limit(1);
            if (error) throw error;
            console.log("[DEBUG] Supabase terhubung, data contoh:", data);
        } catch (err) {
            console.error("[ERROR] Gagal menghubungkan ke Supabase:", err);
        }

        // Cek formulir
        const form = document.getElementById("event-form");
        if (!form) {
            console.error("[ERROR] Formulir event tidak ditemukan!");
            return;
        }

        // Event listener untuk form
        form.addEventListener("submit", async function (event) {
            event.preventDefault();

            // Ambil nilai form
            const name = document.getElementById("name").value.trim();
            const phone = document.getElementById("phone").value.trim();
            const gamertag = document.getElementById("gamertag").value.trim();
            const email = document.getElementById("email").value.trim();
            const termsAgreed = document.getElementById("terms").checked;
            const platform = document.querySelector('input[name="platform"]:checked')?.value || "Tidak ditentukan";

            console.log("[DEBUG] Data form:", { name, phone, gamertag, email, termsAgreed, platform });

            // Validasi
            if (!termsAgreed) {
                document.getElementById("status").textContent = "Anda harus menyetujui syarat & ketentuan!";
                document.getElementById("status").style.color = "red";
                return;
            }

            if (!platform) {
                document.getElementById("status").textContent = "Silakan pilih platform (Java/Bedrock)!";
                document.getElementById("status").style.color = "red";
                return;
            }

            try {
                // Simpan ke Supabase
                const { data, error } = await window.supabase
                    .from("event_registrations")
                    .insert([{ 
                        name, 
                        phone, 
                        gamertag, 
                        email, 
                        platform,
                        terms_agreed: termsAgreed 
                    }]);

                if (error) throw error;

                // Kirim email
                await sendEmail(name, email, platform);

                // Beri feedback sukses
                document.getElementById("status").textContent = "Pendaftaran berhasil! Cek email Anda.";
                document.getElementById("status").style.color = "green";
                form.reset();

            } catch (err) {
                console.error("[ERROR]", err);
                
                let errorMessage = "Terjadi kesalahan saat memproses pendaftaran";
                if (err.message.includes("duplicate")) {
                    errorMessage = "Data sudah terdaftar sebelumnya";
                } else if (err.message.includes("email")) {
                    errorMessage = "Format email tidak valid";
                }
                
                document.getElementById("status").textContent = errorMessage;
                document.getElementById("status").style.color = "red";
            }
        });
    } catch (error) {
        console.error("[ERROR] Gagal menginisialisasi EmailJS:", error);
        document.getElementById("status").textContent = "Sistem email sedang bermasalah, coba lagi nanti";
        document.getElementById("status").style.color = "red";
    }
});