let allMasterRecipes = [];
let activeFilters = {
    kategori: 'all',
    pedas: 'all'
};

document.addEventListener('DOMContentLoaded', () => {
    const mainRecipesCatalogGrid = document.getElementById('mainRecipesCatalogGrid');
    
    if(mainRecipesCatalogGrid) {
        // Tarik data server JSON
        fetch('data/recipes.json')
            .then(res => res.json())
            .then(data => {
                allMasterRecipes = data;
                
                // Cek jika ada perintah url param filter direct khusus dari home
                const urlParams = new URLSearchParams(window.location.search);
                const viewMode = urlParams.get('view');
                
                if(viewMode === 'favorites') {
                    renderFavoriteListOnly();
                } else {
                    applyFiltersAndRender();
                }
                
                setupFilterBadgesEventListeners();
            });
    }
});

function applyFiltersAndRender() {
    const grid = document.getElementById('mainRecipesCatalogGrid');
    const countText = document.getElementById('recipesCountText');
    const searchVal = document.getElementById('searchInput') ? document.getElementById('searchInput').value.toLowerCase() : '';

    let filtered = allMasterRecipes.filter(item => {
        // 1. Kategori filter matching
        const matchKategori = activeFilters.kategori === 'all' || item.kategori === activeFilters.kategori;
        
        // 2. Pedas filter matching
        let matchPedas = true;
        if(activeFilters.pedas === 'Pedas') {
            matchPedas = (item.pedas === 'Pedas' || item.pedas === 'Sangat Pedas');
        } else if(activeFilters.pedas === 'Tidak Pedas') {
            matchPedas = item.pedas === 'Tidak Pedas';
        }

        // 3. Search Matching Engine Multi-Parameter (Nama, Asal, Kategori, Bahan)
        const matchSearch = searchVal === '' || 
            item.nama.toLowerCase().includes(searchVal) ||
            item.asal.toLowerCase().includes(searchVal) ||
            item.kategori.toLowerCase().includes(searchVal) ||
            item.bahan.some(b => b.toLowerCase().includes(searchVal));

        return matchKategori && matchPedas && matchSearch;
    });

    // Bersihkan interface grid
    grid.innerHTML = '';
    
    if(filtered.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 80px 0; opacity: 0.5;"><h3>Tidak ada mahakarya kuliner Batak yang cocok dengan kriteria filter pencarian Anda.</h3></div>`;
        countText.innerText = 'Menampilkan 0 hasil kurasi';
    } else {
        filtered.forEach(recipe => {
            grid.innerHTML += createRecipeCardString(recipe);
        });
        countText.innerText = `Menampilkan ${filtered.length} hasil karya kuliner khas`;
    }
}

function setupFilterBadgesEventListeners() {
    const badges = document.querySelectorAll('.filter-badge');
    badges.forEach(badge => {
        badge.addEventListener('click', (e) => {
            const filterType = e.target.getAttribute('data-filter');
            const filterValue = e.target.getAttribute('data-value');

            // Reset active state group badge bersangkutan
            document.querySelectorAll(`.filter-badge[data-filter="${filterType}"]`).forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            // Update state filter global
            activeFilters[filterType] = filterValue;
            applyFiltersAndRender();
        });
    });
}

function renderFavoriteListOnly() {
    const grid = document.getElementById('mainRecipesCatalogGrid');
    const countText = document.getElementById('recipesCountText');
    const favorites = JSON.parse(localStorage.getItem('batak_favorites')) || [];

    let filtered = allMasterRecipes.filter(item => favorites.includes(item.id));
    
    grid.innerHTML = '';
    document.querySelector('.filter-panel-wrapper').style.display = 'none';
    document.querySelector('.search-wrapper').style.display = 'none';
    document.querySelector('.recipes-hero-header h1').innerText = 'Koleksi Resep Favorit Anda';

    if(filtered.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 80px 0; opacity: 0.5;"><h3>Anda belum menaruh penyimpanan tanda cinta pada resep kuliner manapun.</h3><br><a href="recipes.html" class="btn btn-primary">Jelajahi Sekarang</a></div>`;
        countText.innerText = '0 resep tersimpan';
    } else {
        filtered.forEach(recipe => {
            grid.innerHTML += createRecipeCardString(recipe);
        });
        countText.innerText = `Menampilkan ${filtered.length} resep pusaka yang Anda sukai`;
    }
}

// Kloning helper dari app.js agar runtime standalone aman berjalan terisolasi
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