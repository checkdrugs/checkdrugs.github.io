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
            // redirect to search.html (placeholder)
            window.location.href = 'search.html';
        } else {
            errorEl.textContent = '⛔ invalid username or password';
        }
    }

    // attach event listener
    form.addEventListener('submit', handleLogin);
})();
