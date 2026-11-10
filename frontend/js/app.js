// SportConnect Frontend Application
// Main JavaScript file for all frontend functionality

// API Base URL
const API_BASE = '/api';

// Demo facilities data
const demoFacilities = [
    {
        id: 1,
        name: 'City Sports Complex',
        sport_type: 'football',
        location: 'Downtown',
        price_per_hour: 500,
        image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=400&q=80',
        avg_rating: 4.5,
        review_count: 120
    },
    {
        id: 2,
        name: 'Green Valley Cricket Ground',
        sport_type: 'cricket',
        location: 'Green Valley',
        price_per_hour: 800,
        image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=400&q=80',
        avg_rating: 4.8,
        review_count: 95
    },
    {
        id: 3,
        name: 'Elite Badminton Court',
        sport_type: 'badminton',
        location: 'East Side',
        price_per_hour: 300,
        image: 'https://images.unsplash.com/photo-1622163642998-1ea36b1dde3b?auto=format&fit=crop&w=400&q=80',
        avg_rating: 4.3,
        review_count: 67
    },
    {
        id: 4,
        name: 'Metro Basketball Arena',
        sport_type: 'basketball',
        location: 'Metro City',
        price_per_hour: 600,
        image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=400&q=80',
        avg_rating: 4.6,
        review_count: 82
    },
    {
        id: 5,
        name: 'Sunshine Tennis Club',
        sport_type: 'tennis',
        location: 'Sunshine Park',
        price_per_hour: 450,
        image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=400&q=80',
        avg_rating: 4.7,
        review_count: 54
    },
    {
        id: 6,
        name: 'Multi-Sport Arena',
        sport_type: 'multi-sport',
        location: 'Central District',
        price_per_hour: 1000,
        image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=400&q=80',
        avg_rating: 4.4,
        review_count: 110
    }
];

// Demo bookings data
const demoBookings = [
    {
        id: 1,
        facility_name: 'City Sports Complex',
        facility_image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=400&q=80',
        booking_date: '2024-11-15',
        start_time: '09:00',
        end_time: '10:00',
        amount: 500,
        booking_status: 'confirmed'
    },
    {
        id: 2,
        facility_name: 'Green Valley Cricket Ground',
        facility_image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=400&q=80',
        booking_date: '2024-11-10',
        start_time: '14:00',
        end_time: '16:00',
        amount: 1600,
        booking_status: 'completed'
    }
];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initAuth();
    initFacilities();
    initBookings();
    initProfile();
    initAdmin();
});

// Authentication
function initAuth() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    // Check auth status
    checkAuthStatus();
}

function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    // Update navbar based on auth status
    const authLinks = document.querySelectorAll('.auth-links');
    const userLinks = document.querySelectorAll('.user-links');

    if (token && user) {
        authLinks.forEach(el => el.style.display = 'none');
        userLinks.forEach(el => el.style.display = 'flex');
    } else {
        authLinks.forEach(el => el.style.display = 'flex');
        userLinks.forEach(el => el.style.display = 'none');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value;
    const password = form.password.value;
    const messageEl = document.getElementById('login-message');

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            showMessage(messageEl, 'Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = data.user.role === 'admin' ? 'admin.html' : 'index.html';
            }, 1500);
        } else {
            showMessage(messageEl, data.error || 'Login failed', 'error');
        }
    } catch (error) {
        // Fallback to demo mode
        if (email === 'admin@sportconnect.com' && password === 'Admin@123') {
            const demoUser = { id: 1, name: 'Admin', email, role: 'admin' };
            localStorage.setItem('token', 'demo-token-admin');
            localStorage.setItem('user', JSON.stringify(demoUser));
            showMessage(messageEl, 'Demo login successful! Redirecting...', 'success');
            setTimeout(() => window.location.href = 'admin.html', 1500);
        } else if (email && password) {
            const demoUser = { id: 2, name: 'Demo User', email, role: 'user', phone: '9876543210' };
            localStorage.setItem('token', 'demo-token-user');
            localStorage.setItem('user', JSON.stringify(demoUser));
            showMessage(messageEl, 'Demo login successful! Redirecting...', 'success');
            setTimeout(() => window.location.href = 'index.html', 1500);
        } else {
            showMessage(messageEl, 'Invalid credentials', 'error');
        }
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const email = form.email.value;
    const phone = form.phone.value;
    const password = form.password.value;
    const confirm = form.confirm.value;
    const messageEl = document.getElementById('signup-message');

    if (password !== confirm) {
        showMessage(messageEl, 'Passwords do not match', 'error');
        return;
    }

    if (password.length < 6) {
        showMessage(messageEl, 'Password must be at least 6 characters', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, password, confirmPassword: confirm })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            showMessage(messageEl, 'Registration successful! Redirecting...', 'success');
            setTimeout(() => window.location.href = 'index.html', 1500);
        } else {
            showMessage(messageEl, data.error || 'Registration failed', 'error');
        }
    } catch (error) {
        // Demo mode - create local account
        const demoUser = { id: Date.now(), name, email, phone, role: 'user' };
        localStorage.setItem('token', 'demo-token-' + Date.now());
        localStorage.setItem('user', JSON.stringify(demoUser));
        showMessage(messageEl, 'Demo account created! Redirecting...', 'success');
        setTimeout(() => window.location.href = 'index.html', 1500);
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Facilities
function initFacilities() {
    const facilityList = document.getElementById('facility-list');
    const facilitySearch = document.getElementById('facility-search');
    const sportFilter = document.getElementById('sport-filter');
    const homeSearch = document.getElementById('home-search');
    const homeSport = document.getElementById('home-sport');

    if (facilityList) {
        renderFacilities(demoFacilities, facilityList);
    }

    if (facilitySearch) {
        facilitySearch.addEventListener('input', (e) => {
            const filtered = filterFacilities(demoFacilities, e.target.value, sportFilter?.value);
            renderFacilities(filtered, facilityList);
        });
    }

    if (sportFilter) {
        sportFilter.addEventListener('change', (e) => {
            const filtered = filterFacilities(demoFacilities, facilitySearch?.value, e.target.value);
            renderFacilities(filtered, facilityList);
        });
    }

    if (homeSearch) {
        homeSearch.addEventListener('input', (e) => {
            const filtered = filterFacilities(demoFacilities, e.target.value, homeSport?.value);
            renderFacilities(filtered, facilityList);
        });
    }

    if (homeSport) {
        homeSport.addEventListener('change', (e) => {
            const filtered = filterFacilities(demoFacilities, homeSearch?.value, e.target.value);
            renderFacilities(filtered, facilityList);
        });
    }
}

function filterFacilities(facilities, search, sport) {
    return facilities.filter(f => {
        const matchSearch = !search || 
            f.name.toLowerCase().includes(search.toLowerCase()) ||
            f.location.toLowerCase().includes(search.toLowerCase()) ||
            f.sport_type.toLowerCase().includes(search.toLowerCase());
        const matchSport = !sport || f.sport_type === sport;
        return matchSearch && matchSport;
    });
}

function renderFacilities(facilities, container) {
    if (!container) return;

    if (facilities.length === 0) {
        container.innerHTML = '<div class="empty-state">No facilities found</div>';
        return;
    }

    container.innerHTML = facilities.map(f => `
        <div class="facility-card">
            <img src="${f.image}" alt="${f.name}" onerror="this.src='https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=400&q=80'">
            <div class="facility-info">
                <h3>${f.name}</h3>
                <p>📍 ${f.location}</p>
                <p>${f.sport_type.charAt(0).toUpperCase() + f.sport_type.slice(1)}</p>
                <div class="facility-bottom">
                    <span class="price">₹${f.price_per_hour}/hr</span>
                    <span class="rating">★ ${f.avg_rating}</span>
                </div>
                <a href="facility-details.html?id=${f.id}" class="btn btn-small">View Details</a>
            </div>
        </div>
    `).join('');
}

// Bookings
function initBookings() {
    const bookingList = document.getElementById('booking-list');
    const bookingForm = document.getElementById('booking-form');

    if (bookingList) {
        renderBookings(demoBookings, bookingList);
    }

    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBooking);
    }
}

function renderBookings(bookings, container) {
    if (!container) return;

    if (bookings.length === 0) {
        container.innerHTML = '<div class="empty-state">No bookings yet</div>';
        return;
    }

    container.innerHTML = bookings.map(b => `
        <div class="booking-item">
            <img src="${b.facility_image}" alt="${b.facility_name}" onerror="this.src='https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=400&q=80'">
            <div class="grow">
                <h3>${b.facility_name}</h3>
                <p class="muted small">📅 ${new Date(b.booking_date).toLocaleDateString()}</p>
                <p class="muted small">⏰ ${formatTime(b.start_time)} - ${formatTime(b.end_time)}</p>
                <p class="muted small">💰 ₹${b.amount}</p>
            </div>
            <span class="status ${b.booking_status}">${b.booking_status.charAt(0).toUpperCase() + b.booking_status.slice(1)}</span>
        </div>
    `).join('');
}

function handleBooking(e) {
    e.preventDefault();
    const messageEl = document.getElementById('booking-message');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (!user) {
        showMessage(messageEl, 'Please login to book', 'error');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }

    // Demo booking
    const newBooking = {
        id: Date.now(),
        facility_name: 'Demo Facility',
        facility_image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=400&q=80',
        booking_date: new Date().toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '10:00',
        amount: 500,
        booking_status: 'confirmed'
    };

    demoBookings.unshift(newBooking);
    showMessage(messageEl, 'Booking confirmed! Check My Bookings.', 'success');
    e.target.reset();
}

// Profile
function initProfile() {
    const profileForm = document.getElementById('profile-form');

    if (profileForm) {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (user) {
            profileForm.name.value = user.name || '';
            profileForm.email.value = user.email || '';
            profileForm.phone.value = user.phone || '';
        }

        profileForm.addEventListener('submit', handleProfileUpdate);
    }
}

function handleProfileUpdate(e) {
    e.preventDefault();
    const form = e.target;
    const messageEl = document.getElementById('profile-message');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    user.name = form.name.value;
    user.email = form.email.value;
    user.phone = form.phone.value;

    localStorage.setItem('user', JSON.stringify(user));
    showMessage(messageEl, 'Profile updated successfully!', 'success');
}

// Admin
function initAdmin() {
    const adminBookings = document.getElementById('admin-bookings');
    const statBookings = document.getElementById('stat-bookings');
    const statUsers = document.getElementById('stat-users');
    const statFacilities = document.getElementById('stat-facilities');
    const statRevenue = document.getElementById('stat-revenue');

    if (adminBookings) {
        renderAdminBookings(demoBookings, adminBookings);
    }

    if (statBookings) statBookings.textContent = demoBookings.length;
    if (statUsers) statUsers.textContent = '24';
    if (statFacilities) statFacilities.textContent = demoFacilities.length;
    if (statRevenue) statRevenue.textContent = '₹' + demoBookings.reduce((sum, b) => sum + (b.booking_status === 'confirmed' || b.booking_status === 'completed' ? b.amount : 0), 0);
}

function renderAdminBookings(bookings, container) {
    if (!container) return;

    container.innerHTML = bookings.map(b => `
        <tr>
            <td>${b.facility_name}</td>
            <td>${new Date(b.booking_date).toLocaleDateString()}</td>
            <td>${formatTime(b.start_time)} - ${formatTime(b.end_time)}</td>
            <td>₹${b.amount}</td>
            <td><span class="status ${b.booking_status}">${b.booking_status.charAt(0).toUpperCase() + b.booking_status.slice(1)}</span></td>
        </tr>
    `).join('');
}

// Utility functions
function showMessage(element, text, type) {
    if (!element) return;
    element.textContent = text;
    element.classList.remove('hidden');
    element.style.background = type === 'success' ? '#dcfce7' : type === 'error' ? '#fee2e2' : '#fef3c7';
    element.style.color = type === 'success' ? '#15803d' : type === 'error' ? '#b91c1c' : '#92400e';
    element.style.borderLeft = `4px solid ${type === 'success' ? '#16a34a' : type === 'error' ? '#ef4444' : '#f59e0b'}`;
}

function formatTime(time) {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}
