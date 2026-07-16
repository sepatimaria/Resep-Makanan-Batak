document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    
    if(searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            // Eksekusi filter pencarian setelah 250ms user berhenti mengetik
            debounceTimer = setTimeout(() => {
                if(typeof applyFiltersAndRender === 'function') {
                    applyFiltersAndRender();
                }
            }, 250);
        });
    }
});