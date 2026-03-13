const api = {
    // Determine the API base URL based on the environment
    BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000/api'
        : 'https://garage-connect-api.onrender.com/api', // Replace with your actual deployed URL

    // Token management
    setToken: (token) => {
        localStorage.setItem('gc_token', token);
    },
    getToken: () => {
        return localStorage.getItem('gc_token');
    },
    clearToken: () => {
        localStorage.removeItem('gc_token');
    },
    setUser: (user) => {
        localStorage.setItem('gc_user', JSON.stringify(user));
    },
    getUser: () => {
        const user = localStorage.getItem('gc_user');
        return user ? JSON.parse(user) : null;
    },

    // Fetch wrapper
    async fetch(endpoint, options = {}) {
        const token = this.getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers
        };

        const response = await fetch(`${this.BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        return data;
    },

    // Auth helpers
    async login(email, password) {
        const data = await this.fetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        if (data.success) {
            this.setToken(data.token);
            this.setUser(data.user);
        }
        return data;
    },

    async registerCustomer(payload) {
        return this.fetch('/auth/register/customer', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    },

    async registerOwner(payload) {
        return this.fetch('/auth/register/owner', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    },

    async checkAuth() {
        try {
            const data = await this.fetch('/auth/me');
            if (data.success) {
                this.setUser(data.user);
                return data.user;
            }
        } catch (err) {
            this.logout();
        }
        return null;
    },

    logout() {
        this.clearToken();
        localStorage.removeItem('gc_user');
        window.location.href = 'index.html';
    }
};

// Auto-check session on protected pages
if (!window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('signup.html')) {
    if (!api.getToken()) {
        window.location.href = 'index.html';
    }
}

// Export for use in other scripts
window.gcApi = api;
