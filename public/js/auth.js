const API_URL = `${CONFIG.API_BASE_URL}/auth`;

// Login
async function login(username, password) {
    try {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role); // Store role

            if (data.role === 'cashier') {
                window.location.href = 'cashier-dashboard.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        } else {
            alert(data.msg);
        }
    } catch (err) {
        console.error(err);
        alert('Login failed');
    }
}

// Register
async function register(username, password, role) {
    try {
        const res = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password, role })
        });

        const data = await res.json();

        if (res.ok) {
            // If registered by a manager (token exists), don't auto-login/redirect, just alert success
            if (localStorage.getItem('token')) {
                alert('User created successfully!');
                window.location.href = 'dashboard.html';
            } else {
                // Public registration (first user)
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.role);
                window.location.href = 'dashboard.html';
            }
        } else {
            alert(data.msg);
        }
    } catch (err) {
        console.error(err);
        alert('Registration failed');
    }
}

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = 'index.html';
}

// Check Auth
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
    }
}
