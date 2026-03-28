// Auth utility functions
function getToken() {
    return localStorage.getItem('salama-token');
}

function getUser() {
    const userStr = localStorage.getItem('salama-user');
    return userStr ? JSON.parse(userStr) : null;
}

function requireAuth() {
    const token = getToken();
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function requireRole(...roles) {
    const user = getUser();
    if (!user || !roles.includes(user.role)) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

function logout() {
    localStorage.removeItem('salama-token');
    localStorage.removeItem('salama-user');
    window.location.href = 'index.html';
}

function updateRoleBaseNavbar() {
    const token = getToken();
    const user = getUser();

    // Hide/show public links
    document.querySelectorAll('[data-public-nav]').forEach(el => {
        el.classList.toggle('hidden', !!token);
    });

    if (token && user) {
        // Display username + role
        const userDisplay = document.getElementById('user-display');
        if (userDisplay) {
            userDisplay.textContent = `${user.username} (${user.role})`;
        }

        // Show role-specific nav
        document.querySelectorAll('[data-role-nav]').forEach(el => {
            const allowedRoles = el.getAttribute('data-role-nav')?.split(',') || [];
            el.classList.toggle('hidden', !allowedRoles.includes(user.role));
        });

        // Show auth logout
        document.querySelectorAll('[data-auth-nav]').forEach(el => {
            el.classList.remove('hidden');
        });
    } else {
        // Hide auth controls
        document.querySelectorAll('[data-auth-nav]').forEach(el => {
            el.classList.add('hidden');
        });
        document.querySelectorAll('[data-role-nav]').forEach(el => {
            el.classList.add('hidden');
        });
    }

    // Logout handler
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}

// Run on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateRoleBaseNavbar);
} else {
    updateRoleBaseNavbar();
}
