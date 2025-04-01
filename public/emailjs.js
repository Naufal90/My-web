document.addEventListener("DOMContentLoaded", function() {
    if (typeof emailjs !== "undefined") {
        emailjs.init("XMkiGop9M7sa3w1V_"); // Ganti dengan User ID dari EmailJS
        console.log("[DEBUG] EmailJS berhasil diinisialisasi.");
    } else {
        console.error("[ERROR] EmailJS tidak ditemukan! Pastikan library sudah di-load.");
    }
});

// Konstanta untuk EmailJS
const EMAILJS_CONFIG = {
    SERVICE_ID: "service_8h7daa7",   // Ganti dengan Service ID
    TEMPLATE_ID: "template_p4sylrw"  // Ganti dengan Template ID
};

// Fungsi untuk mengirim email
function sendEmail(name, email) {
    return emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, {
        to_name: name,
        to_email: email,
        message: "Terima kasih telah mendaftar di Event building Part 1 KimNetwork!"
    }).then(function(response) {
        console.log("[DEBUG] Email berhasil dikirim:", response);
    }).catch(function(error) {
        console.error("[ERROR] Gagal mengirim email:", error);
    });
}
