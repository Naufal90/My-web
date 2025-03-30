document.addEventListener('DOMContentLoaded', () => {
  // Daftar staff dengan skin (sesuaikan dengan ID di HTML)
  const staffList = [
    { id: "head-kimo1", skinUrl: "https://raw.githubusercontent.com/Naufal90/My-web/main/kimo_skin.png" },
    { id: "head-naufal", skinUrl: "https://raw.githubusercontent.com/Naufal90/My-web/main/public/assets/Naufal90.png" },
    { id: "head-kimo2", skinUrl: "https://raw.githubusercontent.com/Naufal90/My-web/main/kimo_skin.png" },
    { id: "head-kimo3", skinUrl: "https://raw.githubusercontent.com/Naufal90/My-web/main/kimo_skin.png" },
    { id: "head-kimo4", skinUrl: "https://raw.githubusercontent.com/Naufal90/My-web/main/kimo_skin.png" }
  ];

  // Fungsi untuk memotong kepala skin
  function renderSkinHead(canvasId, skinUrl) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      console.error("Canvas tidak ditemukan:", canvasId);
      return;
    }

    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.crossOrigin = "Anonymous";
    img.src = skinUrl + "?t=" + new Date().getTime(); // Hindari cache

    img.onload = () => {
      // Sesuaikan dengan ukuran canvas di HTML (80x80)
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 8, 8, 8, 8, 0, 0, 80, 80);
    };

    img.onerror = () => {
      console.error("Gagal memuat skin:", skinUrl);
      // Fallback: buat placeholder
      ctx.fillStyle = "#555";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
  }

  // Render semua staff
  staffList.forEach(staff => {
    if (staff.skinUrl) {
      renderSkinHead(staff.id, staff.skinUrl);
    }
  });

  // Animasi fade-in dengan Intersection Observer
  const staffMembers = document.querySelectorAll('.staff-member');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, { 
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px" // Trigger saat 50px dari bawah viewport
  });

  staffMembers.forEach(member => {
    observer.observe(member);
  });
});