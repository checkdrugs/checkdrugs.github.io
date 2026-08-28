(function() {
    // ---------- hardcoded credentials ----------
    const DEFAULT_USER = 'admin';
    const DEFAULT_PASS = 'solo';

    // DOM refs
    const form = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorEl = document.getElementById('loginError');

    // ---------- login handler ----------
    function handleLogin(e) {
        e.preventDefault();          // prevent page reload

        const user = usernameInput.value.trim();
        const pass = passwordInput.value.trim();

        // reset previous error
        errorEl.textContent = '';

        // check credentials
        if (user === DEFAULT_USER && pass === DEFAULT_PASS) {
            // redirect to search.html
            window.location.href = 'search.html';
        } else {
            errorEl.textContent = '⛔ invalid username or password';
        }
    }

    // attach event listener
    form.addEventListener('submit', handleLogin);
})();

(function() {
    // ---------- configuration ----------
    // Replace with your actual Apps Script web app URL
    const API_URL = 'https://script.google.com/macros/s/AKfycbzzKAmnfCe9O7I56Tb8Fnye-2-GMvpGkyYR574E7uULX2wao9lK77Z9jn6WOiPCZzru/exec';

    // DOM refs
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('resultsContainer');
    const searchStats = document.getElementById('searchStats');

    // ---------- fetch all data from Google Sheet ----------
    async function fetchAllData() {
        try {
            const response = await fetch(API_URL, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Fetch error:', error);
            return null;
        }
    }

    // ---------- search/filter data ----------
    function searchData(data, query) {
        if (!data || !data.length) return [];
        if (!query || query.trim() === '') return data;

        const lowerQuery = query.toLowerCase().trim();
        
        return data.filter(row => {
            // row structure: [ID, Drug Class, Drug, Active Ingredients, Presentation Size, Form, What It Treats, Balance]
            const id = (row[0] || '').toLowerCase();
            const drugClass = (row[1] || '').toLowerCase();
            const drug = (row[2] || '').toLowerCase();
            const ingredients = (row[3] || '').toLowerCase();
            const form = (row[5] || '').toLowerCase();
            const treats = (row[6] || '').toLowerCase();

            return id.includes(lowerQuery) ||
                   drugClass.includes(lowerQuery) ||
                   drug.includes(lowerQuery) ||
                   ingredients.includes(lowerQuery) ||
                   form.includes(lowerQuery) ||
                   treats.includes(lowerQuery);
        });
    }

    // ---------- render results ----------
    function renderResults(results, query) {
        if (!results || results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <p>😕 No results found for "<strong>${query || ''}</strong>"</p>
                    <p style="margin-top: 0.5rem; font-size: 0.9rem; color: #7a8a9a;">Try a different search term</p>
                </div>
            `;
            searchStats.textContent = '0 results found';
            return;
        }

        let html = '';
        results.forEach(row => {
            const id = row[0] || '';
            const drugClass = row[1] || '';
            const drug = row[2] || '';
            const ingredients = row[3] || '';
            const presentation = row[4] || '';
            const form = row[5] || '';
            const treats = row[6] || '';
            const balance = row[7] || 0;

            // Build the result item
            html += `
                <div class="result-item">
                    <div class="drug-name">${drug}</div>
                    ${ingredients ? `<div class="drug-detail"><strong>Ingredients:</strong> ${ingredients}</div>` : ''}
                    ${form ? `<div class="drug-detail"><strong>Form:</strong> ${form}</div>` : ''}
                    ${presentation ? `<div class="drug-detail"><strong>Presentation:</strong> ${presentation}</div>` : ''}
                    ${drugClass ? `<div class="drug-detail"><strong>Class:</strong> ${drugClass}</div>` : ''}
                    ${treats ? `<div class="drug-detail"><strong>Treats:</strong> ${treats}</div>` : ''}
                    <div class="balance">💰 Balance: ${balance}</div>
                    ${id ? `<div style="font-size: 0.75rem; color: #7a8a9a; margin-top: 0.3rem;">ID: ${id}</div>` : ''}
                </div>
            `;
        });

        resultsContainer.innerHTML = html;
        searchStats.textContent = `${results.length} result${results.length > 1 ? 's' : ''} found`;
    }

    // ---------- handle search ----------
    async function handleSearch(e) {
        e.preventDefault();

        const query = searchInput.value;
        
        // Show loading state
        resultsContainer.innerHTML = '<div class="loading">⏳ Searching...</div>';
        searchStats.textContent = '';

        // Fetch all data
        const data = await fetchAllData();

        if (!data) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <p>⚠️ Error connecting to the server</p>
                    <p style="margin-top: 0.5rem; font-size: 0.9rem; color: #7a8a9a;">Please check your connection and try again</p>
                </div>
            `;
            searchStats.textContent = '';
            return;
        }

        // Filter results
        const filtered = searchData(data, query);
        
        // Render
        renderResults(filtered, query);
    }

    // ---------- load all data on page load (show initial results) ----------
    async function loadInitialData() {
        resultsContainer.innerHTML = '<div class="loading">⏳ Loading data...</div>';
        
        const data = await fetchAllData();
        
        if (!data) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <p>⚠️ Could not load data</p>
                    <p style="margin-top: 0.5rem; font-size: 0.9rem; color: #7a8a9a;">Please check your connection and refresh</p>
                </div>
            `;
            return;
        }

        // Show all data initially (empty search)
        renderResults(data, '');
        searchInput.placeholder = 'Search by drug name, ID, active ingredients...';
    }

    // ---------- event listeners ----------
    searchForm.addEventListener('submit', handleSearch);

    // ---------- initialize ----------
    loadInitialData();

})();
