document.addEventListener("DOMContentLoaded", function() {
    if (typeof emailjs !== "undefined") {
        emailjs.init("XMkiGop9M7sa3w1V_"); // Ganti dengan User ID dari EmailJS
        console.log("[DEBUG] EmailJS berhasil diinisialisasi.");
    } else {
        console.error("[ERROR] EmailJS tidak ditemukan! Pastikan library sudah di-load.");
    }
});
