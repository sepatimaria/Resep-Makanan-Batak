document.addEventListener('DOMContentLoaded', () => {
    // 1. Matikan Loading Screen
    const loader = document.getElementById('loadingScreen');
    if(loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 800);
        }, 1000);
    }

    // 2. Navbar Glassmorphism Scroll Effect
    const navbar = document.getElementById('mainNavbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 80) {
            navbar.classList.add('navbar-scrolled');
        } else {
            // Hanya hapus jika bukan di page catalog/detail yang butuh sticky solid
            if(!document.body.classList.contains('bg-light-magazine') && !document.body.classList.contains('detail-page-body')) {
                navbar.classList.remove('navbar-scrolled');
            }
        }
    });

    // 3. Render Lauk Utama Pilihan di Landing Page (Index)
    const featuredRecipesGrid = document.getElementById('featuredRecipesGrid');
    if(featuredRecipesGrid) {
        fetch('data/recipes.json')
            .then(res => res.json())
            .then(data => {
                // Tampilkan 4 menu pertama sebagai highlight
                const highlights = data.slice(0, 4);
                highlights.forEach(recipe => {
                    featuredRecipesGrid.innerHTML += createRecipeCardString(recipe);
                });
            }).catch(err => console.error("Gagal memuat repositori data kuliner: ", err));
    }

    // 4. Deteksi Detail Page Rendering Engine via Parameter URL
    const detailContainer = document.getElementById('detailContainer');
    if(detailContainer) {
        const urlParams = new URLSearchParams(window.location.search);
        const recipeId = urlParams.get('id') || 'arsik'; // default fallback arsik jika parameter kosong
        
        fetch('data/recipes.json')
            .then(res => res.json())
            .then(recipes => {
                const target = recipes.find(r => r.id === recipeId);
                if(target) {
                    renderDetailPage(target, recipes);
                    setupFavoriteButtonSystem(target.id);
                } else {
                    detailContainer.innerHTML = `<div class="container-editorial"><h2>Resep Warisan Adat Tidak Ditemukan</h2><a href="recipes.html" class="btn btn-primary">Kembali ke Katalog</a></div>`;
                }
            });
    }
});

// Helper string template generator kartu resep Airbnb Style
function createRecipeCardString(recipe) {
    return `
        <article class="premium-food-card">
            <div class="card-img-container">
                <img src="${recipe.gambar}" alt="${recipe.nama}">
                <span class="card-badge-category">${recipe.kategori}</span>
            </div>
            <div class="card-body-content">
                <div class="card-meta-row">
                    <span>📍 ${recipe.asal}</span>
                    <span>⏱️ ${recipe.waktu} Menit</span>
                </div>
                <h3>${recipe.nama}</h3>
                <p class="card-desc-short">${recipe.deskripsi}</p>
                <div class="card-footer-action">
                    <span class="card-rating-indicator">⭐ ${recipe.rating.toFixed(1)}</span>
                    <a href="detail.html?id=${recipe.id}" class="btn btn-primary ripple" style="padding: 10px 20px; font-size:0.8rem;">Lihat Resep</a>
                </div>
            </div>
        </article>
    `;
}

// Render Mesin Detail Resep Editorial Komprehensif
function renderDetailPage(r, allRecipes) {
    const detailContainer = document.getElementById('detailContainer');
    
    // Pecah list bahan html
    let bahanHtml = '';
    r.bahan.forEach(b => bahanHtml += `<li>${b}</li>`);
    
    // Pecah urutan langkah memasak
    let langkahHtml = '';
    r.caraMemasak.forEach(step => langkahHtml += `<li>${step}</li>`);

    // Cari rekomendasi rekomendasi kuliner lain
    let rekomendasiCardsHtml = '';
    const filteredRekomendasi = allRecipes.filter(item => r.rekomendasi.includes(item.id));
    filteredRekomendasi.forEach(rec => {
        rekomendasiCardsHtml += createRecipeCardString(rec);
    });

    detailContainer.innerHTML = `
        <header class="detail-hero-section">
            <div class="detail-hero-img" style="background-image: url('${r.gambar}');"></div>
            <div class="detail-hero-overlay"></div>
            <div class="container-fluid">
                <div class="detail-header-meta">
                    <span class="section-tag" style="color:var(--gold)">${r.kategori} &bull; ${r.asal}</span>
                    <h1>${r.nama}</h1>
                    <div class="meta-badges-flex">
                        <span class="detail-badge badge-gold-filled">⭐ Rating ${r.rating.toFixed(1)}</span>
                        <span class="detail-badge">🌶️ Tingkat: ${r.pedas}</span>
                        <span class="detail-badge">⏱️ Total: ${r.totalWaktu} Menit</span>
                        <span class="detail-badge">🔥 ${r.kalori} Kalori</span>
                    </div>
                </div>
            </div>
        </header>

        <main class="container-fluid">
            <div class="detail-grid-layout">
                <!-- Sisi Kiri: Editorial Informasi Masak -->
                <div class="detail-main-content">
                    <section class="editorial-block" style="padding:0; margin-bottom:60px;">
                        <h2>Deskripsi Filosofis</h2>
                        <p>${r.deskripsi}</p>
                    </section>

                    <section class="editorial-block" style="padding:0; margin-bottom:60px;">
                        <h2>Sejarah Budaya</h2>
                        <p>${r.sejarah}</p>
                        <blockquote style="border-left:4px solid var(--primary-red); padding-left:20px; font-style:italic; opacity:0.9; margin-top:20px;">
                            <strong>Makna Kultural:</strong> ${r.maknaBudaya}
                        </blockquote>
                    </section>

                    <section class="editorial-block" style="padding:0; margin-bottom:60px;">
                        <h2>Bahan Baku Tradisional</h2>
                        <ul class="ingredients-list">
                            ${bahanHtml}
                        </ul>
                    </section>

                    <section class="editorial-block" style="padding:0; margin-bottom:60px;">
                        <h2>Tahapan Memasak Langkah-demi-Langkah</h2>
                        <ol class="cooking-steps-ol">
                            ${langkahHtml}
                        </ol>
                    </section>

                    <div class="tips-box-glass">
                        <h3>Tips Rahasia Kuliner</h3>
                        <p>${r.tips}</p>
                    </div>
                </div>

                <!-- Sisi Kanan: Spesifikasi Data Teknis & Fakta (NatGeo Panel) -->
                <div class="detail-sidebar-content">
                    <div style="position: sticky; top: 120px;">
                        <h3 class="section-tag">TECNICAL DATAFACT</h3>
                        <table class="premium-specs-table">
                            <tr><td>Persiapan Fisik</td><td>${r.persiapan} Menit</td></tr>
                            <tr><td>Durasi Pengapian</td><td>${r.waktu} Menit</td></tr>
                            <tr><td>Total Durasi Ektraksi</td><td>${r.totalWaktu} Menit</td></tr>
                            <tr><td>Kapasitas Saji porsi</td><td>${r.porsi} Orang</td></tr>
                            <tr><td>Tingkat Hambatan Kesulitan</td><td>${r.kesulitan}</td></tr>
                        </table>

                        <div class="tips-box-glass" style="background:rgba(74, 35, 90, 0.05); margin-top:30px;">
                            <h4 style="font-family:var(--font-title); margin-bottom:10px; color:var(--primary-red);">Fakta Menarik</h4>
                            <p style="font-size:0.9rem; line-height:1.6; opacity:0.8;">${r.fakta}</p>
                            <p style="font-size:0.85rem; margin-top:15px; font-weight:600;">🍽️ Cocok Disandingkan dengan:<br><span style="color:var(--accent-purple);">${r.cocokDisajikan}</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <!-- Rekomendasi Horizontal Section -->
        <section style="background: rgba(18,18,18,0.02); border-top: 1px solid rgba(18,18,18,0.05);">
            <div class="container-fluid">
                <h2 style="font-family:var(--font-title); font-size:2.2rem; margin-bottom:40px; text-align:center;">Rekomendasi Cita Rasa Lain</h2>
                <div class="modern-menu-grid">
                    ${rekomendasiCardsHtml}
                </div>
            </div>
        </section>
    `;
}

// Sistem Management Penyimpanan Local Storage untuk Menu Favorit
function setupFavoriteButtonSystem(recipeId) {
    const favBtn = document.getElementById('recipeFavBtn');
    if(!favBtn) return;

    let favorites = JSON.parse(localStorage.getItem('batak_favorites')) || [];
    
    if(favorites.includes(recipeId)) {
        favBtn.innerHTML = '❤️ Tersimpan di Favorit';
        favBtn.style.background = 'var(--primary-red)';
        favBtn.style.color = '#fff';
    }

    favBtn.addEventListener('click', () => {
        favorites = JSON.parse(localStorage.getItem('batak_favorites')) || [];
        if(favorites.includes(recipeId)) {
            favorites = favorites.filter(id => id !== recipeId);
            favBtn.innerHTML = '❤️ Simpan Favorit';
            favBtn.style.background = 'var(--glass-bg)';
            favBtn.style.color = 'var(--secondary-black)';
        } else {
            favorites.push(recipeId);
            favBtn.innerHTML = '❤️ Tersimpan di Favorit';
            favBtn.style.background = 'var(--primary-red)';
            favBtn.style.color = '#fff';
        }
        localStorage.setItem('batak_favorites', JSON.stringify(favorites));
    });
}