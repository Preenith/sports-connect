// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : 'https://sports-booking-api.onrender.com/api'; // Replace with your actual backend URL after deployment

// Export for use in other files
window.API_BASE_URL = API_BASE_URL;

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
    const url = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url.replace('/api', '')}`;
    
    const response = await fetch(fullUrl, options);
    return response.json();
}

window.apiCall = apiCall;
