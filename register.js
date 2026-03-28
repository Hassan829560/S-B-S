// API base URL
const API_BASE = 'http://localhost:5000/api';

// DOM elements
const registerForm = document.getElementById('register-form');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');
const roleSelect = document.getElementById('role');

// Handle register form submission
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const role = roleSelect.value;

    // Validation
    if (!username || !email || !password || !confirmPassword || !role) {
        showError('Please fill in all fields.');
        return;
    }

    if (password !== confirmPassword) {
        showError('Passwords do not match.');
        return;
    }

    if (password.length < 6) {
        showError('Password must be at least 6 characters long.');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, role })
        });

        const data = await res.json();
        if (!res.ok) {
            showError(data.message || 'Registration failed.');
            return;
        }

        showSuccess('Registration successful! Redirecting to login...');
        registerForm.reset();

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    } catch (error) {
        console.error('Registration error:', error);
        showError('Registration failed. Please try again later.');
    }
});

// Show error message
function showError(message) {
    hideMessages();
    let errorDiv = document.querySelector('.error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message text-red-600 mt-3';
        registerForm.appendChild(errorDiv);
    }
    errorDiv.textContent = message;
}

// Show success message
function showSuccess(message) {
    hideMessages();
    let successDiv = document.querySelector('.success-message');
    if (!successDiv) {
        successDiv = document.createElement('div');
        successDiv.className = 'success-message text-green-600 mt-3';
        registerForm.appendChild(successDiv);
    }
    successDiv.textContent = message;
}

// Hide messages
function hideMessages() {
    const errorDiv = document.querySelector('.error-message');
    const successDiv = document.querySelector('.success-message');
    if (errorDiv) errorDiv.remove();
    if (successDiv) successDiv.remove();
}
