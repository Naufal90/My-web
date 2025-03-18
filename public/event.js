const supabaseUrl = "https://iafrlxyoeostvhnoywnv.supabase.co";  // Ganti dengan Supabase URL
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhZnJseHlvZW9zdHZobm95d252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1MzMwNjAsImV4cCI6MjA1NDEwOTA2MH0.WEdZeif209ew2iEWsGs9Y10529hDFI9BVdFvz_7Yeno"; // Ganti dengan API Key Supabase kamu
const resendApiKey = "re_cnfCgBHC_DFZhhpdRx5iaxVUanuPomiLS";  // Ganti dengan Resend API Key

const supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);

document.getElementById("event-form").addEventListener("submit", async function (event) {
    event.preventDefault();
    console.log("[INFO] Form pendaftaran dikirim...");

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const gamertag = document.getElementById("gamertag").value.trim();
    const email = document.getElementById("email").value.trim();
    const termsAgreed = document.getElementById("terms").checked;

    console.log("[DEBUG] Data yang dimasukkan:", { name, phone, gamertag, email, termsAgreed });

    if (!termsAgreed) {
        document.getElementById("status").textContent = "Anda harus menyetujui syarat & ketentuan!";
        console.warn("[WARNING] User belum menyetujui syarat & ketentuan.");
        return;
    }

    try {
        console.log("[INFO] Mengirim data ke Supabase...");
        const { data, error } = await supabase.from("event_registrations").insert([
            { name, phone, gamertag, email, terms_agreed: termsAgreed }
        ]);

        if (error) {
            console.error("[ERROR] Gagal menyimpan data ke Supabase:", error.message);
            throw error;
        }

        console.log("[SUCCESS] Data berhasil disimpan di Supabase:", data);

        // Kirim notifikasi email via Resend
        console.log("[INFO] Mengirim email konfirmasi...");
        await sendEmail(name, email);

        document.getElementById("status").textContent = "Pendaftaran berhasil! Cek email Anda.";
        document.getElementById("event-form").reset();
    } catch (err) {
        document.getElementById("status").textContent = "Terjadi kesalahan: " + err.message;
        console.error("[ERROR] Terjadi kesalahan:", err.message);
    }
});

// Fungsi untuk mengirim email via Resend
async function sendEmail(name, email) {
    const eventName = "Event KimNetwork";  // Ganti dengan nama event

    try {
        console.log("[INFO] Mengirim email ke:", email);
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

        if (!response.ok) {
            console.error("[ERROR] Gagal mengirim email konfirmasi.");
            throw new Error("Gagal mengirim email konfirmasi.");
        }

        console.log("[SUCCESS] Email konfirmasi berhasil dikirim ke:", email);
    } catch (error) {
        console.error("[ERROR] Terjadi kesalahan saat mengirim email:", error.message);
    }
}
